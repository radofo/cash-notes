<script lang="ts">
	import { page } from '$app/stores';
	import { Loader2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { insertCashFlow, isInMonth } from '../../network/cash_flow';
	import { insertDebtSupabase } from '../../network/debt';
	import { friendsStore } from '../../stores/friends';
	import { geminiApiKey } from '../../stores/gemini';
	import type {
		ParsedReceipt,
		ReceiptItemWithSplit,
		ReceiptScannerStep,
		ReceiptWithSplits
	} from '../../types/receipt';
	import { cashFlowStore } from '../../utils/cashFlow.store';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import { debtReloadTrigger } from '../../utils/debt.store';
	import ApiKeyModal from './ApiKeyModal.svelte';
	import FloatingButton from './FloatingButton.svelte';
	import ReceiptCameraView from './ReceiptCameraView.svelte';
	import ReceiptFinalOverview from './ReceiptFinalOverview.svelte';
	import ReceiptItemSplit from './ReceiptItemSplit.svelte';
	import ReceiptOverview from './ReceiptOverview.svelte';
	import ReceiptPhotoReview from './ReceiptPhotoReview.svelte';

	const dispatch = createEventDispatcher<{
		receiptSaved: ReceiptWithSplits;
	}>();

	// Stores
	$: supabase = $page.data.supabase;
	$: user = $page.data.session?.user;
	$: cashGroups = $cashGroupStore;
	$: friends = $friendsStore;

	// State
	let showApiKeyModal = false;
	let currentStep: ReceiptScannerStep | 'closed' = 'closed';
	let capturedImage: string | null = null;
	let parsedReceipt: ParsedReceipt | null = null;
	let error: string | null = null;
	let isLoading = false;

	// Edited receipt data
	let editedReceipt = {
		name: '',
		total: 0,
		budgetId: '',
		date: '',
		friendId: ''
	};

	// Item splits
	let itemSplits: ReceiptItemWithSplit[] = [];
	let currentItemIndex = 0;

	// Selected friend name for display
	$: selectedFriend = friends.find((f) => f.id === editedReceipt.friendId);
	$: friendName = selectedFriend?.full_name || 'Freund';

	function handleButtonClick() {
		if (!$geminiApiKey) {
			showApiKeyModal = true;
			return;
		}
		startFlow();
	}

	function handleApiKeySaved() {
		startFlow();
	}

	function startFlow() {
		currentStep = 'camera';
		capturedImage = null;
		parsedReceipt = null;
		error = null;
		itemSplits = [];
		currentItemIndex = 0;
	}

	function closeFlow() {
		currentStep = 'closed';
		capturedImage = null;
		parsedReceipt = null;
		error = null;
		itemSplits = [];
		currentItemIndex = 0;
	}

	function handleCapture(event: CustomEvent<string>) {
		capturedImage = event.detail;
		currentStep = 'review';
	}

	function handleRetake() {
		capturedImage = null;
		currentStep = 'camera';
	}

	async function handleContinueFromReview() {
		if (!capturedImage) return;

		currentStep = 'loading';
		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/parse-receipt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					imageBase64: capturedImage,
					apiKey: $geminiApiKey
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Fehler beim Parsen des Kassenbons');
			}

			parsedReceipt = data.receipt;
			currentStep = 'overview';
		} catch (err) {
			console.error('Error parsing receipt:', err);
			error = err instanceof Error ? err.message : 'Fehler beim Parsen des Kassenbons';
			currentStep = 'review';
		} finally {
			isLoading = false;
		}
	}

	function handleOverviewContinue(
		event: CustomEvent<{
			name: string;
			total: number;
			budgetId: string;
			date: string;
			friendId: string;
			items: { name: string; totalPrice: number }[];
		}>
	) {
		const data = event.detail;

		editedReceipt = {
			name: data.name,
			total: data.total,
			budgetId: data.budgetId,
			date: data.date,
			friendId: data.friendId
		};

		// Initialize item splits with 50% default
		itemSplits = data.items.map((item) => ({
			name: item.name,
			totalPrice: item.totalPrice,
			friendPercentage: 50,
			friendAmount: Math.round(item.totalPrice * 0.5 * 100) / 100,
			ownAmount: Math.round(item.totalPrice * 0.5 * 100) / 100
		}));

		currentItemIndex = 0;
		currentStep = 'split';
	}

	function handleItemUpdate(event: CustomEvent<{ index: number; item: ReceiptItemWithSplit }>) {
		const { index, item } = event.detail;
		itemSplits[index] = item;
		itemSplits = itemSplits;
	}

	function handleItemsDone(event: CustomEvent<ReceiptItemWithSplit[]>) {
		itemSplits = event.detail;
		currentStep = 'summary';
	}

	function handleShowSummary() {
		currentStep = 'summary';
	}

	function handleEditItem(event: CustomEvent<number>) {
		currentItemIndex = event.detail;
		currentStep = 'split';
	}

	async function handleFinalDone() {
		if (!user?.id || !editedReceipt.budgetId) return;

		isLoading = true;

		try {
			const friendTotal = itemSplits.reduce((sum, item) => sum + item.friendAmount, 0);
			const ownTotal = itemSplits.reduce((sum, item) => sum + item.ownAmount, 0);

			const receiptJson: ReceiptWithSplits = {
				storeName: editedReceipt.name,
				date: editedReceipt.date,
				total: editedReceipt.total,
				budgetId: editedReceipt.budgetId,
				friendId: editedReceipt.friendId,
				items: itemSplits,
				ownTotal,
				friendTotal
			};

			// Insert debt if there's a friend portion
			let debtId: string | undefined = undefined;
			if (friendTotal > 0 && editedReceipt.friendId) {
				const debt = await insertDebtSupabase(
					{
						amount: friendTotal,
						name: editedReceipt.name,
						date: editedReceipt.date,
						for_id: editedReceipt.friendId,
						from_id: user.id,
						receipt: receiptJson
					},
					supabase
				);
				debtId = debt?.id;
				if (debt) {
					debtReloadTrigger.triggerReload();
				}
			}

			// Insert cash flow for own portion
			if (ownTotal > 0) {
				const selectedMonth = new Date().getMonth();
				const selectedYear = new Date().getFullYear();

				const newCashFlow = await insertCashFlow(
					{
						amount: ownTotal,
						name: editedReceipt.name,
						cash_group_id: editedReceipt.budgetId,
						date: editedReceipt.date,
						debt_id: debtId,
						owner: user.id
					},
					supabase
				);

				if (newCashFlow && isInMonth(newCashFlow, selectedMonth, selectedYear)) {
					cashFlowStore.insertCashFlow(newCashFlow);
				}
			}

			dispatch('receiptSaved', receiptJson);
			closeFlow();
		} catch (err) {
			console.error('Error saving receipt:', err);
			error = err instanceof Error ? err.message : 'Fehler beim Speichern';
		} finally {
			isLoading = false;
		}
	}
</script>

<FloatingButton on:click={handleButtonClick} />

<ApiKeyModal bind:showModal={showApiKeyModal} on:saved={handleApiKeySaved} />

{#if currentStep === 'camera'}
	<ReceiptCameraView on:capture={handleCapture} on:close={closeFlow} />
{/if}

{#if currentStep === 'review' && capturedImage}
	<ReceiptPhotoReview
		{capturedImage}
		on:retake={handleRetake}
		on:continue={handleContinueFromReview}
		on:close={closeFlow}
	/>
{/if}

{#if currentStep === 'loading'}
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
		<Loader2 size={48} class="animate-spin text-primary" />
		<p class="text-muted-foreground">Kassenbon wird analysiert...</p>
		{#if error}
			<div
				class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
				role="alert"
				aria-live="polite"
			>
				{error}
			</div>
		{/if}
	</div>
{/if}

{#if currentStep === 'overview' && parsedReceipt}
	<ReceiptOverview
		{parsedReceipt}
		{cashGroups}
		{friends}
		on:continue={handleOverviewContinue}
		on:close={closeFlow}
	/>
{/if}

{#if currentStep === 'split' && itemSplits.length > 0}
	<ReceiptItemSplit
		items={itemSplits}
		currentIndex={currentItemIndex}
		total={editedReceipt.total}
		{friendName}
		storeName={editedReceipt.name}
		date={editedReceipt.date}
		on:update={handleItemUpdate}
		on:done={handleItemsDone}
		on:showSummary={handleShowSummary}
		on:close={closeFlow}
	/>
{/if}

{#if currentStep === 'summary' && itemSplits.length > 0}
	<ReceiptFinalOverview
		items={itemSplits}
		total={editedReceipt.total}
		{friendName}
		storeName={editedReceipt.name}
		date={editedReceipt.date}
		on:done={handleFinalDone}
		on:editItem={handleEditItem}
		on:close={closeFlow}
	/>
{/if}
