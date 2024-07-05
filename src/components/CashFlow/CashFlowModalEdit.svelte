<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import { deleteCashFlow, updateCashFlow } from '../../network/cash_flow';
	import type { CashFlow, CashGroup } from '../../types/supabase';
	import { cashFlowStore } from '../../utils/cashFlow.store';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import { dateToDateString } from '../../utils/date';
	import FormDialog from '../FormDialog/FormDialog.svelte';
	import Input from '../Input.svelte';
	import InputWithLabel from '../InputWithLabel.svelte';

	export let open: boolean;
	export let cashFlowToEdit: CashFlow | undefined;

	$: cashGroups = $cashGroupStore;
	$: activeCashGroups = cashGroups.filter((cashGroup) => cashGroup.is_active);
	$: supabase = $page.data.supabase;
	$: user = $page.data.session.user;

	let cfId: string = '';
	let cfName: string = '';
	let cfAmount: string = '';
	let cfGroup: CashGroup | undefined;
	let cfDate: string = dateToDateString(new Date());

	let modalCreateLoading: boolean = false;
	let modalDeleteLoading: boolean = false;

	$: {
		if (open) {
			initModal();
		} else {
			resetModal();
		}
	}

	async function initModal() {
		if (cashFlowToEdit) {
			const { name, id, amount, date, cash_group } = cashFlowToEdit;
			cfAmount = amount.toString();
			cfName = name;
			cfId = id;
			cfDate = dateToDateString(new Date(date));
			cfGroup = cash_group;
		}
	}

	function resetModal() {
		cfId = '';
		cfName = '';
		cfAmount = '';
		cfGroup = activeCashGroups?.[0];
		cfDate = dateToDateString(new Date());
	}

	async function deleteCashFlowHandler(id: string) {
		modalDeleteLoading = true;
		const wasDeleteSuccess = await deleteCashFlow(id, supabase);
		if (wasDeleteSuccess) {
			cashFlowStore.removeCashFlow(id);
		}
		modalDeleteLoading = false;
		open = false;
	}

	async function submitEditedCashFlow() {
		if (user?.id && cfGroup?.id && cfName && cfAmount && cfId) {
			const amountNumber = Number.parseFloat(cfAmount);
			if (amountNumber <= 0) {
				return;
			}
			modalCreateLoading = true;
			const updatedCashFlow = await updateCashFlow(
				{
					id: cfId,
					amount: amountNumber,
					name: cfName,
					cash_group_id: cfGroup.id,
					date: cfDate
				},
				supabase
			);
			if (updatedCashFlow) {
				cashFlowStore.updateCashFlow(updatedCashFlow);
			}
			modalCreateLoading = false;
			open = false;
		}
	}

	function oncfGroupChange(newGroupName: string) {
		cfGroup = activeCashGroups.find((cashGroup) => cashGroup.name === newGroupName);
	}
</script>

<FormDialog bind:open on:submit={submitEditedCashFlow}>
	<span slot="header">Ausgabe Bearbeiten</span>
	<div slot="content" class="flex h-full flex-col justify-between">
		<div class="flex flex-col gap-3">
			<InputWithLabel label="Name">
				<Input inputType="text" bind:inputValue={cfName} />
			</InputWithLabel>
			<InputWithLabel label="Betrag">
				<Input inputType="number" bind:inputValue={cfAmount} />
			</InputWithLabel>
			<InputWithLabel label="Budget">
				<select
					on:change={(e) => oncfGroupChange(e?.currentTarget?.value)}
					class="select w-full border border-slate-200 p-2 text-base"
				>
					{#each activeCashGroups as cashGroup}
						<option selected={cashGroup.id === cfGroup?.id}>{cashGroup.name}</option>
					{/each}
				</select>
			</InputWithLabel>
			<InputWithLabel label="Datum">
				<Input inputType="date" bind:inputValue={cfDate} />
			</InputWithLabel>
		</div>
		<div class="flex flex-col gap-2">
			<Button variant="default" type="submit">
				{#if modalCreateLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else}
					Speichern
				{/if}
			</Button>
			<Button on:click={() => deleteCashFlowHandler(cfId)} variant="destructive" type="button">
				{#if modalDeleteLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else}
					Löschen
				{/if}
			</Button>
		</div>
	</div>
</FormDialog>
