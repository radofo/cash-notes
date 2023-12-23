<script lang="ts">
	import { onMount } from 'svelte';
	import type { CashGroup, InsertCashGroupDTO, UpdateCashGroupDTO } from '../supabaseTypes';
	import Input from './Input.svelte';
	import type { User } from '@supabase/supabase-js';

	export let user: User;
	export let insertCashGroup: (dto: InsertCashGroupDTO) => void;

	let cashGroupName: string = '';
	let cashGroupBudget: string = '';

	function onInsertCashGroup() {
		if (user?.id) {
			insertCashGroup({ budget: cashGroupBudget, name: cashGroupName, owner: user.id });
			cashGroupName = '';
			cashGroupBudget = '';
		}
	}
</script>

<li class="w-100 flex flex-row items-center gap-2">
	<Input bind:inputValue={cashGroupName} inputType="text" hint="New Budget" />
	<Input bind:inputValue={cashGroupBudget} inputType="number" hint={'0€'} />
	<button
		class="flex-1 rounded-lg bg-green-200 p-2 pl-3 pr-3 font-poppins text-sm font-semibold leading-7 text-green-900"
		on:click={onInsertCashGroup}>Create</button
	>
</li>
