<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import { deleteCashFlow, updateCashFlow } from '../../network/cash_flow';
	import type { CashFlow, CashFlowUpdate, CashGroup } from '../../types/supabase';
	import { cashFlowStore } from '../../utils/cashFlow.store';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import { dateToDateString } from '../../utils/date';
	import FormDialog from '../FormDialog/FormDialog.svelte';
	import Input from '../Input.svelte';
	import InputWithLabel from '../InputWithLabel.svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import {
		deleteDebtSupabase,
		getDebtById,
		insertDebtSupabase,
		updateDebtSupabase
	} from '../../network/debt';
	import { friendsStore, noFriend } from '../../stores/friends';
	import { formatCurrency, toFloat } from '../../utils/currency';
	import type { Profile } from '../../types/friendship';
	import { getDebtAction } from '../../utils/debt.helpers';
	import DebtStatusLabel from './DebtStatusLabel.svelte';

	export let open: boolean;
	export let cashFlowToEdit: CashFlow | undefined;

	let modalEditLoading: boolean = false;
	let modalDeleteLoading: boolean = false;
	let formInitLoading: boolean = false;

	$: cashGroups = $cashGroupStore;
	// $: activeCashGroups = cashGroups.filter((cashGroup) => cashGroup.is_active);
	$: supabase = $page.data.supabase;
	$: user = $page.data.session.user;
	$: friends = [noFriend, ...$friendsStore];
	let debt: DebtWithProfile | null = null;
	$: debtEditable = debt && debt?.is_accepted !== 'accepted';
	let createdFromDebt: DebtWithProfile | null = null;
	$: showDebtUI = friends.length > 1 && !cashFlowToEdit?.created_from_debt_id;

	// Form
	let cfId: string = '';
	let cfName: string = '';
	let cfTotalAmount: string = '';
	let cfGroup: CashGroup | undefined;
	let cfDate: string = dateToDateString(new Date());
	let cfFriend: Profile | undefined = undefined;
	let cfFriendAmount: string = '';

	// Helper Variables
	$: friendAmountLabel = `${cfFriend?.full_name}s Anteil`;

	$: {
		if (open) {
			initModal();
		} else {
			resetModal();
		}
	}

	async function initModal() {
		formInitLoading = true;
		if (cashFlowToEdit?.debt_id) {
			debt = await getDebtById(cashFlowToEdit.debt_id, supabase);
		}
		if (!createdFromDebt && cashFlowToEdit?.created_from_debt_id) {
			createdFromDebt = await getDebtById(cashFlowToEdit.created_from_debt_id, supabase);
		}
		if (cashFlowToEdit) {
			const { name, id, amount: existingAmount, date, cash_group } = cashFlowToEdit;
			const existingFriendAmount = debt?.amount ?? 0;
			cfTotalAmount = (existingAmount + existingFriendAmount).toString();
			cfName = name;
			cfId = id;
			cfDate = dateToDateString(new Date(date));
			cfGroup = cash_group;
			cfFriend = debt?.for || noFriend;
			cfFriendAmount = existingFriendAmount === 0 ? '' : existingFriendAmount.toString();
		}
		formInitLoading = false;
	}

	function resetModal() {
		cfId = '';
		cfName = '';
		cfTotalAmount = '';
		cfGroup = cashGroups?.[0];
		cfDate = dateToDateString(new Date());
		debt = null;
		cfFriend = noFriend;
		cfFriendAmount = '';
	}

	async function deleteCashFlowHandler(id: string) {
		modalDeleteLoading = true;
		const wasDeleteSuccess = await deleteCashFlow(id, supabase);
		if (wasDeleteSuccess) {
			cashFlowStore.removeCashFlow(id);
		}
		if (debtEditable) {
			await deleteDebt();
		}
		modalDeleteLoading = false;
		open = false;
	}

	async function submitEditedCashFlow() {
		modalEditLoading = true;
		if (user?.id && cfGroup?.id && cfName && cfTotalAmount && cfId) {
			const totalNumber = toFloat(cfTotalAmount);
			const friendAmountNumber = toFloat(cfFriendAmount);
			const selfAmountNumber = totalNumber - friendAmountNumber;
			if (selfAmountNumber <= 0) {
				return;
			}
			let updateResult: DebtWithProfile | null = null;
			let deleteResult: boolean = false;
			let insertResult: DebtWithProfile | null = null;
			let newDebtId = debt?.id ?? null;
			if (friends.length > 1) {
				const action = getDebtAction({
					currentDebt: debt,
					debtForm: {
						cfFriend,
						cfFriendAmount
					}
				});
				switch (action) {
					case 'addDebt': {
						insertResult = await insertDebt();
						newDebtId = insertResult?.id ?? null;
						break;
					}
					case 'deleteDebt': {
						deleteResult = await deleteDebt();
						if (deleteResult) {
							newDebtId = null;
						}
						break;
					}
					case 'updateDebt': {
						updateResult = await updateDebt();
						newDebtId = updateResult?.id ?? null;
						break;
					}
				}
			}
			await updateModalCashFlow({
				id: cfId,
				amount: selfAmountNumber,
				name: cfName,
				cash_group_id: cfGroup.id,
				date: cfDate,
				debt_id: newDebtId
			});
		}
		modalEditLoading = false;
		open = false;
	}
	async function updateModalCashFlow(cashFlowUpdate: CashFlowUpdate) {
		const updatedCashFlow = await updateCashFlow(cashFlowUpdate, supabase);
		if (updatedCashFlow) {
			cashFlowStore.updateCashFlow(updatedCashFlow);
		}
	}

	async function updateDebt(): Promise<DebtWithProfile | null> {
		if (!debt) return null;
		const result = updateDebtSupabase(
			debt,
			{
				id: debt.id,
				amount: toFloat(cfFriendAmount),
				for_id: cfFriend?.id
			},
			user.id,
			supabase
		);
		return result;
	}
	async function deleteDebt(): Promise<boolean> {
		if (!debt) return false;
		return deleteDebtSupabase(debt?.id, supabase);
	}
	async function insertDebt(): Promise<DebtWithProfile | null> {
		if (!cfFriend) return null;
		const debt = await insertDebtSupabase(
			{
				amount: toFloat(cfFriendAmount),
				name: cfName,
				date: cfDate,
				for_id: cfFriend?.id,
				from_id: user.id
			},
			supabase
		);
		return debt;
	}

	function oncfGroupChange(newGroupName: string) {
		cfGroup = cashGroups.find((cashGroup) => cashGroup.name === newGroupName);
	}
	function oncfFriendChange(newFriendId: string) {
		cfFriend = friends.find((friend) => friend.id === newFriendId);
		if (cfFriend?.id === noFriend.id) {
			cfFriendAmount = '';
		}
	}
</script>

<FormDialog bind:open on:submit={submitEditedCashFlow}>
	<span slot="header">Ausgabe Bearbeiten</span>
	<div slot="content" class="flex h-full flex-col justify-between">
		{#if !formInitLoading}
			<div class="flex flex-col gap-3">
				<InputWithLabel label="Name">
					<Input inputType="text" bind:inputValue={cfName} />
				</InputWithLabel>
				<InputWithLabel label="Betrag Gesamt">
					<Input inputType="number" bind:inputValue={cfTotalAmount} />
				</InputWithLabel>
				<InputWithLabel label="Budget">
					<select
						on:change={(e) => oncfGroupChange(e?.currentTarget?.value)}
						class="select w-full border border-slate-200 p-2 text-base"
					>
						{#each cashGroups as cashGroup}
							<option selected={cashGroup.id === cfGroup?.id}>{cashGroup.name}</option>
						{/each}
					</select>
				</InputWithLabel>
				<InputWithLabel label="Datum">
					<Input inputType="date" bind:inputValue={cfDate} />
				</InputWithLabel>
				{#if showDebtUI}
					<div class="mt-5 flex flex-col gap-3 border-t border-dashed pt-5">
						<div class="flex items-center justify-end">
							<DebtStatusLabel is_accepted={debt?.is_accepted} />
						</div>
						<InputWithLabel label="Ausgabe Für">
							<select
								disabled={!debtEditable}
								on:change={(e) => oncfFriendChange(e?.currentTarget?.value)}
								class="select w-full border border-slate-200 p-2 text-base"
							>
								{#each friends as friend}
									<option value={friend.id} selected={friend.id === cfFriend?.id}
										>{friend.full_name}</option
									>
								{/each}
							</select>
						</InputWithLabel>
						{#if cfFriend && cfFriend?.id !== noFriend.id}
							<InputWithLabel label={friendAmountLabel}>
								<Input
									disabled={!debtEditable}
									inputType="number"
									bind:inputValue={cfFriendAmount}
								/>
							</InputWithLabel>
							{#if toFloat(cfFriendAmount) > toFloat(cfTotalAmount)}
								<p class="text-xs text-red-500">
									Der Anteil des Freundes darf nicht größer sein als der Gesamtbetrag.
								</p>
							{:else}
								<InputWithLabel label="Dein Anteil">
									<div class="rounded-lg border bg-gray-100 p-2">
										{formatCurrency(toFloat(cfTotalAmount) - toFloat(cfFriendAmount))}
									</div>
								</InputWithLabel>
							{/if}
						{/if}
					</div>
				{/if}
			</div>
			<!-- 	Actions	 -->
			<div class="mt-7 flex flex-col gap-2">
				<Button class="py-6" variant="default" type="submit">
					{#if modalEditLoading}
						<div class="grid place-items-center">
							<IconLoader class="animate-spin text-center" />
						</div>
					{:else}
						Speichern
					{/if}
				</Button>
				<Button
					class="py-6"
					on:click={() => deleteCashFlowHandler(cfId)}
					variant="destructive"
					type="button"
				>
					{#if modalDeleteLoading}
						<div class="grid place-items-center">
							<IconLoader class="animate-spin text-center" />
						</div>
					{:else}
						Löschen{!debt ? '' : debtEditable ? ' (inkl. Schuld)' : ' (ohne Schuld)'}
					{/if}
				</Button>
			</div>
		{/if}
	</div>
</FormDialog>
