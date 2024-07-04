<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconX } from '@tabler/icons-svelte';
	import type { FormTimeframe } from '../../../types/recurring';
	import type { CashGroup } from '../../../types/supabase';
	import { cashGroupStore } from '../../../utils/cashGroup.store';
	import { getSurroundingYears, months } from '../../../utils/date';
	import FullMonthSelector from '../../FullMonthSelector.svelte';
	import Input from '../../Input.svelte';
	import InputWithLabel from '../../InputWithLabel.svelte';

	$: cashGroups = $cashGroupStore;

	export let formName = '';
	export let formIsIncome = false;
	export let formCashGroup: CashGroup | undefined;
	export let formTimeframes: FormTimeframe[];
	export let deletedTimeframes: FormTimeframe[] | undefined = [];

	function onCashGroupChange(newGroupName: string) {
		formCashGroup = cashGroups.find((cashGroup) => cashGroup.name === newGroupName);
	}

	function addTimeframe() {
		formTimeframes = [
			...formTimeframes,
			{
				startMonth: new Date().getMonth(),
				startYear: new Date().getFullYear(),
				amount: '',
				id: new Date().getTime().toString()
			}
		];
	}

	function removeTimeframe(timeframeToDelete: FormTimeframe) {
		formTimeframes = formTimeframes.filter((frame) => frame.id !== timeframeToDelete.id);
		if (deletedTimeframes) {
			deletedTimeframes.push(timeframeToDelete);
		}
	}
</script>

<div class="flex flex-col gap-5">
	<InputWithLabel label="Name">
		<Input inputType="text" bind:inputValue={formName} />
	</InputWithLabel>
	<InputWithLabel label="Einnahme">
		<input type="checkbox" class="toggle toggle-success" bind:checked={formIsIncome} />
	</InputWithLabel>
	{#if !formIsIncome}
		<InputWithLabel label="Budget">
			<select
				on:change={(e) => onCashGroupChange(e?.currentTarget?.value)}
				class="select w-full border border-slate-200 p-2 text-base"
			>
				<option class="text-slate-500" selected={!formCashGroup?.id} disabled
					>-- Budget wählen --</option
				>
				{#each cashGroups as cashGroup}
					<option selected={cashGroup.id === formCashGroup?.id}>{cashGroup.name}</option>
				{/each}
			</select>
		</InputWithLabel>
	{/if}
	<div class="flex w-full flex-col gap-1">
		<div class="flex gap-2">
			<span class="w-[40%] text-sm text-slate-500"> Betrag </span>
			<span class="flex-1 text-sm text-slate-500"> Gültig ab </span>
		</div>
		<div class="flex flex-col gap-4">
			{#each formTimeframes as timeframe}
				<div class="flex items-center gap-2 border-b py-3 last-of-type:border-0">
					<div class="w-[40%]">
						<Input inputType="number" bind:inputValue={timeframe.amount} />
					</div>
					<div class="flex flex-1 items-center justify-between">
						<div class="flex flex-col gap-2">
							<FullMonthSelector
								on:monthChanged={(e) => (timeframe.startMonth = e.detail)}
								on:yearChanged={(e) => (timeframe.startYear = e.detail)}
								selectedMonth={timeframe.startMonth}
								selectedYear={timeframe.startYear}
								{months}
								years={getSurroundingYears(new Date().getFullYear())}
							/>
						</div>
						<button
							class="pl-1 text-slate-500"
							type="button"
							on:click|preventDefault={() => removeTimeframe(timeframe)}
						>
							<IconX size={24} />
						</button>
					</div>
				</div>
			{/each}
			<Button variant="secondary" on:click={addTimeframe}>+</Button>
		</div>
	</div>
</div>
