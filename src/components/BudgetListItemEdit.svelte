<script lang="ts">
	import { onMount } from 'svelte';
	import type { CashGroup, UpdateCashGroupDTO } from '../supabaseTypes';
	import Input from './Input.svelte';

	export let cashGroupToBeUpdated: CashGroup;
	export let updateCashGroup: (dto: UpdateCashGroupDTO) => void;

	let cashGroupName: string = '';
	let cashGroupBudget: string = '';

	onMount(() => {
		if (cashGroupToBeUpdated) {
			cashGroupName = cashGroupToBeUpdated.name;
			cashGroupBudget = cashGroupToBeUpdated.budget.toString();
		}
	});

	function onSaveCashGroup() {
		updateCashGroup({ budget: cashGroupBudget, name: cashGroupName, id: cashGroupToBeUpdated.id });
		cashGroupName = '';
		cashGroupBudget = '';
	}
</script>

<li class="flex w-full flex-row items-center justify-between gap-1 border-b pb-3 pt-3 text-lg">
	<!-- <div class="w-52"> -->
	<div>
		<Input bind:inputValue={cashGroupName} inputType="text" />
	</div>
	<div class="flex justify-end gap-2">
		<div class="">
			<Input bind:inputValue={cashGroupBudget} inputType="number" />
		</div>
		<button
			class="rounded-lg bg-blue-100 p-2 pl-3 pr-3 font-poppins text-sm font-semibold leading-7 text-blue-900"
			on:click={onSaveCashGroup}>Update</button
		>
	</div>
</li>
