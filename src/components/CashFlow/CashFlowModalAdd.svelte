<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import { insertCashFlow, isInMonth } from '../../network/cash_flow';
	import type { CashGroup } from '../../types/supabase';
	import { cashFlowStore } from '../../utils/cashFlow.store';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import { dateToDateString } from '../../utils/date';
	import FormDialog from '../FormDialog/FormDialog.svelte';
	import Input from '../Input.svelte';
	import InputWithLabel from '../InputWithLabel.svelte';

	export let open: boolean;

	$: cashGroups = $cashGroupStore;
	$: activeCashGroups = cashGroups.filter((cashGroup) => cashGroup.is_active);
	$: supabase = $page.data.supabase;
	$: user = $page.data.session.user;

	let cfName: string = '';
	let cfAmount: string = '';
	let cfGroup: CashGroup | undefined;
	let cfDate: string = dateToDateString(new Date());

	let selectedMonth = new Date().getMonth();
	let selectedYear = new Date().getFullYear();

	let modalCreateLoading: boolean = false;

	$: {
		if (!open) {
			resetModal();
		} else {
			cfGroup = activeCashGroups?.[0];
		}
	}

	function resetModal() {
		cfName = '';
		cfAmount = '';
		cfGroup = activeCashGroups?.[0];
		cfDate = dateToDateString(new Date());
	}

	async function submitNewCashFlow() {
		if (user?.id && cfGroup?.id && cfName && cfAmount) {
			modalCreateLoading = true;
			const amountNumber = Number.parseFloat(cfAmount);
			if (amountNumber <= 0) {
				return;
			}
			const newCashFlow = await insertCashFlow(
				{
					amount: amountNumber,
					name: cfName,
					cash_group_id: cfGroup.id,
					date: cfDate,
					owner: user.id
				},
				supabase
			);
			if (newCashFlow && isInMonth(newCashFlow, selectedMonth, selectedYear)) {
				cashFlowStore.insertCashFlow(newCashFlow);
			}
			modalCreateLoading = false;
			open = false;
		}
	}

	function oncfGroupChange(newGroupName: string) {
		cfGroup = activeCashGroups.find((cashGroup) => cashGroup.name === newGroupName);
	}
</script>

<FormDialog bind:open on:submit={submitNewCashFlow}>
	<span slot="header">Neue Ausgabe Erstellen</span>
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
		</div>
	</div>
</FormDialog>
