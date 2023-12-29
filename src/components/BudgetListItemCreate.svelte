<script lang="ts">
	import Button from './Button.svelte';

	import type { CashGroupInsert } from '../types/supabase';
	import Input from './Input.svelte';
	import type { User } from '@supabase/supabase-js';

	export let user: User;
	export let insertCashGroup: (dto: CashGroupInsert) => void;

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
	<Input textAlign="text-right" bind:inputValue={cashGroupBudget} inputType="number" hint={'0€'} />
	<Button variant="success" on:btnclick={onInsertCashGroup}>Create</Button>
</li>
