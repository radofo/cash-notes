<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Loader2 } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import ApiKeyModal from '../../components/ReceiptScanner/ApiKeyModal.svelte';
	import ReceiptCameraView from '../../components/ReceiptScanner/ReceiptCameraView.svelte';
	import ReceiptFinalOverview from '../../components/ReceiptScanner/ReceiptFinalOverview.svelte';
	import ReceiptItemSplit from '../../components/ReceiptScanner/ReceiptItemSplit.svelte';
	import ReceiptOverview from '../../components/ReceiptScanner/ReceiptOverview.svelte';
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

	// Stores
	$: supabase = $page.data.supabase;
	$: user = $page.data.session?.user;
	$: cashGroups = $cashGroupStore;
	$: friends = $friendsStore;

	// State
	let showApiKeyModal = false;
	let currentStep: ReceiptScannerStep = 'camera';
	let capturedImage: string | null = null;
	let parsedReceipt: ParsedReceipt | null = null;
	let error: string | null = null;
	let isLoading = false;
	let toastMessage: string | null = null;

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

	onMount(() => {
		if (!$geminiApiKey) {
			showApiKeyModal = true;
		}
	});

	function handleApiKeySaved() {
		showApiKeyModal = false;
	}

	function closeFlow() {
		goto('/');
	}

	async function handleCapture(event: CustomEvent<string>) {
		capturedImage = event.detail;
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

			// Validate that total matches sum of items
			// Commented out: Allow user to proceed even if validation fails
			// if (parsedReceipt) {
			// 	const itemsSum = parsedReceipt.items.reduce((sum, item) => sum + item.totalPrice, 0);
			// 	const receiptTotal = parsedReceipt.total ?? 0;
			// 	const tolerance = 0.02; // Allow 2 cent tolerance for rounding

			// 	if (Math.abs(itemsSum - receiptTotal) > tolerance) {
			// 		toastMessage = 'Der Kassenbon wurde nicht korrekt erkannt. Bitte erneut scannen.';
			// 		capturedImage = null;
			// 		currentStep = 'camera';
			// 		setTimeout(() => {
			// 			toastMessage = null;
			// 		}, 4000);
			// 		return;
			// 	}
			// }

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

		// Initialize item splits with 0% default (all to self)
		itemSplits = data.items.map((item) => ({
			name: item.name,
			totalPrice: item.totalPrice,
			friendPercentage: 0,
			friendAmount: 0,
			ownAmount: item.totalPrice
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
			const friendTotal =
				Math.round(itemSplits.reduce((sum, item) => sum + item.friendAmount, 0) * 100) / 100;
			const ownTotal =
				Math.round(itemSplits.reduce((sum, item) => sum + item.ownAmount, 0) * 100) / 100;

			// Receipt for debt without friendId and budgetId
			const receiptForDebt: ReceiptWithSplits = {
				storeName: editedReceipt.name,
				date: editedReceipt.date,
				total: editedReceipt.total,
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
						receipt: receiptForDebt
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

			// Navigate back to home after saving
			goto('/');
		} catch (err) {
			console.error('Error saving receipt:', err);
			error = err instanceof Error ? err.message : 'Fehler beim Speichern';
		} finally {
			isLoading = false;
		}
	}
</script>

<ApiKeyModal bind:showModal={showApiKeyModal} on:saved={handleApiKeySaved} />

{#if currentStep === 'camera'}
	<ReceiptCameraView on:capture={handleCapture} on:close={closeFlow} />
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

{#if toastMessage}
	<div class="toast toast-center toast-top z-[100] max-w-[calc(100vw-2rem)] px-4">
		<div class="alert alert-error">
			<span class="text-white">{toastMessage}</span>
		</div>
	</div>
{/if}
