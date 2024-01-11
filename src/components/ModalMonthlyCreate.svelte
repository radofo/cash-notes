<script lang="ts">
	import { IconLoader, IconX } from '@tabler/icons-svelte';
	import { insertRecCashFlow, insertRecTimeframes } from '../network/rec_cash_flow';
	import type { CashGroup, RecCashFlow, RecTimeframeInsert } from '../types/supabase';
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import InputWithLabel from './InputWithLabel.svelte';
	import Modal from './Modal.svelte';
	import type { SupabaseClient, User } from '@supabase/supabase-js';
	import { getSurroundingYears, months } from '../utils/date';
	import FullMonthSelector from './FullMonthSelector.svelte';
	import type { FormTimeframe } from '../types/recurring';
	import { formToInserted } from '../utils/recurring';

	export let cashGroups: CashGroup[];
	export let showModal: boolean;
	export let user: User;
	export let supabase: SupabaseClient;
	export let insertRecCashFlowList: (newCashFlow: RecCashFlow) => void;

	let modalLoading = false;

	let rcfName = '';
	let rcfIsIncome = false;
	let rcfCashGroup: CashGroup | undefined;
	let rcfTimeframes: Array<FormTimeframe> = [];

	$: {
		if (!showModal) {
			resetModal();
		}
	}
	$: {
		if (rcfIsIncome) {
			rcfCashGroup = undefined;
		}
	}

	function resetModal() {
		rcfName = '';
		rcfIsIncome = false;
		rcfCashGroup = undefined;
		rcfTimeframes = [];
	}

	async function submitNewRecurringCashFlow() {
		if (user?.id && (rcfCashGroup?.id || rcfIsIncome) && rcfName && rcfTimeframes.length) {
			modalLoading = true;
			const newRecCashFlow = await insertRecCashFlow(
				{
					cash_group_id: rcfCashGroup?.id,
					name: rcfName,
					isIncome: rcfIsIncome,
					owner: user.id
				},
				supabase
			);
			if (newRecCashFlow.id) {
				const timeframesToInsert = rcfTimeframes.map((rcfTimeframe): RecTimeframeInsert => {
					return formToInserted(rcfTimeframe, user.id, newRecCashFlow.id);
				});
				const newRecTimeframes = await insertRecTimeframes(timeframesToInsert, supabase);
				if (newRecTimeframes.length) {
					insertRecCashFlowList({
						...newRecCashFlow,
						timeframes: newRecTimeframes
					});
				}
			}
			modalLoading = false;
			showModal = false;
		}
	}
	function onCashGroupChange(newGroupName: string) {
		rcfCashGroup = cashGroups.find((cashGroup) => cashGroup.name === newGroupName);
	}
	function addTimeframe() {
		rcfTimeframes = [
			{ startMonth: new Date().getMonth(), startYear: new Date().getFullYear(), amount: '' },
			...rcfTimeframes
		];
	}
	function removeTimeframe(toDelete: FormTimeframe) {
		rcfTimeframes = rcfTimeframes.filter(
			(frame) =>
				!(frame.startMonth === toDelete.startMonth && frame.startYear === toDelete.startYear)
		);
	}
</script>

<Modal bind:showModal>
	<h2 class="mb-3 text-center text-xl font-semibold" slot="header">
		{`Neue monatliche ${rcfIsIncome ? 'Einnahme' : 'Ausgabe'}`}
	</h2>
	<form class="flex flex-col gap-5" on:submit={submitNewRecurringCashFlow}>
		<div class="flex flex-col gap-5">
			<InputWithLabel label="Name">
				<Input inputType="text" bind:inputValue={rcfName} />
			</InputWithLabel>
			<InputWithLabel label="Einnahme">
				<input type="checkbox" class="toggle-success toggle" bind:checked={rcfIsIncome} />
			</InputWithLabel>
			{#if !rcfIsIncome}
				<InputWithLabel label="Kategorie">
					<select
						on:change={(e) => onCashGroupChange(e?.currentTarget?.value)}
						class="select w-full border border-slate-200 p-2 text-base"
					>
						<option class="text-slate-500" selected={!rcfCashGroup?.id} disabled
							>-- Kategorie wählen --</option
						>
						{#each cashGroups as cashGroup}
							<option selected={cashGroup.id === rcfCashGroup?.id}>{cashGroup.name}</option>
						{/each}
					</select>
				</InputWithLabel>
			{/if}
			<div class="flex flex-col gap-1">
				<div class="flex gap-1">
					<span class="w-[50%] text-sm text-slate-500"> Betrag </span>
					<span class="w-[50%] text-sm text-slate-500"> Gültig ab </span>
				</div>
				{#each rcfTimeframes as timeframe}
					<div class="flex items-center gap-1">
						<div class="w-[50%]">
							<Input inputType="number" bind:inputValue={timeframe.amount} />
						</div>
						<div class="flex w-[50%] justify-between">
							<FullMonthSelector
								on:monthChanged={(e) => (timeframe.startMonth = e.detail)}
								on:yearChanged={(e) => (timeframe.startYear = e.detail)}
								selectedMonth={timeframe.startMonth}
								selectedYear={timeframe.startYear}
								{months}
								years={getSurroundingYears(new Date().getFullYear())}
							/>
							<button on:click={() => removeTimeframe(timeframe)}>
								<IconX class="min-w-fit border-l pl-1 text-slate-500" size={24} />
							</button>
						</div>
					</div>
				{/each}
				<Button variant="dashed" on:btnclick={addTimeframe}>+</Button>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<Button variant="success" type="submit">
				{#if modalLoading}
					<IconLoader class="animate-spin text-center" />
				{/if}
				Speichern
			</Button>
		</div>
	</form>
</Modal>
