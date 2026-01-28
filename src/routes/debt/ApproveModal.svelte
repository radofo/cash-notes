<script lang="ts">
	import { page } from '$app/stores';
	import FormDialog from '../../components/FormDialog/FormDialog.svelte';
	import Input from '../../components/Input.svelte';
	import InputWithLabel from '../../components/InputWithLabel.svelte';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import type { CashGroup } from '../../types/supabase';
	import { dateToDateString } from '../../utils/date';
	import type { DebtWithProfile } from '../../types/debt';
	import { toFloat } from '../../utils/currency';
	import { insertCashFlow } from '../../network/cash_flow';
	import { reactToDebt } from '../../network/debt';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';

	export let toApproveDebts: DebtWithProfile[];
	export let open: boolean;
	export let updateDebtList: (debt: DebtWithProfile) => void;

	$: cashGroups = $cashGroupStore;
	$: user = $page.data.session.user;
	$: supabase = $page.data.supabase;
	$: activeDebt = toApproveDebts[0];

	let formInitLoading: boolean = false;
	let approvingLoading: boolean = false;
	let rejectLoading: boolean = false;

	// Form
	let cfName: string = '';
	let cfTotalAmount: string = '';
	let cfGroup: CashGroup | undefined;
	let cfDate: string = dateToDateString(new Date());

	$: {
		const newToApproveDebts = toApproveDebts;
		nextDebt();
	}

	$: {
		if (open) {
			nextDebt();
		} else {
			resetModal();
		}
	}

	function nextDebt() {
		resetModal();
		if (toApproveDebts.length > 0) {
			cfName = activeDebt.name || '';
			cfTotalAmount = activeDebt.amount.toString() || '';
			cfGroup = cashGroups[0];
			cfDate = dateToDateString(new Date(activeDebt.date));
		} else {
			open = false;
		}
	}

	function resetModal() {
		cfName = '';
		cfTotalAmount = '';
		cfGroup = cashGroups[0];
		cfDate = dateToDateString(new Date());
		formInitLoading = false;
	}

	async function approveDebt() {
		if (!user?.id || !cfGroup?.id || !cfName || !cfTotalAmount) {
			return;
		}
		approvingLoading = true;

		const updatedDebt = await reactToDebt(activeDebt, 'accepted', user.id, supabase);
		if (updatedDebt) {
			await insertCashFlow(
				{
					amount: toFloat(cfTotalAmount),
					name: cfName,
					cash_group_id: cfGroup.id,
					date: cfDate,
					created_from_debt_id: activeDebt.id,
					owner: user.id
				},
				supabase
			);
			updateDebtList(updatedDebt);
		}
		approvingLoading = false;
	}

	async function rejectDebt() {
		if (!user?.id) {
			return;
		}
		rejectLoading = true;

		const updatedDebt = await reactToDebt(activeDebt, 'rejected', user.id, supabase);
		if (updatedDebt) {
			updateDebtList(updatedDebt);
		}
		rejectLoading = false;
	}

	function oncfGroupChange(newGroupName: string) {
		cfGroup = cashGroups.find((cashGroup) => cashGroup.name === newGroupName);
	}
</script>

<FormDialog bind:open on:submit={approveDebt}>
	<span slot="header">Ausgaben Bestätigen (1/{toApproveDebts.length})</span>
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
						class="select w-full border border-input bg-background p-2 text-base"
					>
						{#each cashGroups as cashGroup}
							<option selected={cashGroup.id === cfGroup?.id}>{cashGroup.name}</option>
						{/each}
					</select>
				</InputWithLabel>
				<InputWithLabel label="Datum">
					<Input inputType="date" bind:inputValue={cfDate} />
				</InputWithLabel>
			</div>
		{/if}
		<div class="flex flex-col gap-2">
			<Button
				on:click={rejectDebt}
				class="bg-red-100 py-6 text-red-800 hover:bg-red-200"
				variant="destructive"
				type="button"
			>
				{#if rejectLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else}
					Ablehnen
				{/if}
			</Button>
			<Button
				class="bg-green-100 py-6 text-green-800 hover:bg-green-200"
				variant="default"
				type="submit"
			>
				{#if approvingLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else}
					Bestätigen
				{/if}
			</Button>
		</div>
	</div>
</FormDialog>
