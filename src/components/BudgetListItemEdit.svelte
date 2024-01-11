<script lang="ts">
	import { onMount } from 'svelte';
	import type { CashGroup, CashGroupUpdate } from '../types/supabase';
	import Input from './Input.svelte';
	import Button from './Button.svelte';

	export let cashGroupToBeUpdated: CashGroup;
	export let updateCashGroup: (dto: CashGroupUpdate) => void;

	let cashGroupName: string = '';
	let cashGroupBudget: string = '';

	onMount(() => {
		if (cashGroupToBeUpdated) {
			cashGroupName = cashGroupToBeUpdated.name;
			cashGroupBudget = cashGroupToBeUpdated.budget?.toString() ?? '';
		}
	});

	function onSaveCashGroup() {
		updateCashGroup({ budget: cashGroupBudget, name: cashGroupName, id: cashGroupToBeUpdated.id });
		cashGroupName = '';
		cashGroupBudget = '';
	}
</script>

<li class="flex w-full flex-row items-center justify-between gap-1 border-b pb-3 pt-3 text-lg">
	<div>
		<Input bind:inputValue={cashGroupName} inputType="text" />
	</div>
	<div class="flex justify-end gap-2">
		<div class="">
			<Input textAlign="text-right" bind:inputValue={cashGroupBudget} inputType="number" />
		</div>
		<Button on:btnclick={onSaveCashGroup}>Update</Button>
	</div>
</li>
