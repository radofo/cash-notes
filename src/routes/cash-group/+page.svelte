<script lang="ts">
	import { IconHeart } from '@tabler/icons-svelte';
	import type { InsertCashGroupDTO } from '../../supabaseTypes';
	import { insertCashGroup } from '../../auth';
	import type { PageData } from './$types';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let cashGroupName: string = '';
	let cashGroupIsSaving: boolean = false;
	let cashGroupIsDefinedByFixedCost: boolean = false;
	let cashGroupIsRestOfSaving: boolean = false;
	let cashGroupTags: string[] = [];
	let cashGroupBudget: number = 0;

	async function saveCashGroup() {
		if (user?.id) {
			const dto: InsertCashGroupDTO = {
				budget: cashGroupBudget,
				name: cashGroupName,
				isSaving: cashGroupIsSaving,
				user_id: user?.id,
				isDefinedByFixedCost: cashGroupIsDefinedByFixedCost,
				isRestOfSaving: cashGroupIsRestOfSaving,
				tags: cashGroupTags
			};
			await insertCashGroup(dto, supabase);
		}
	}
</script>

{#if user}
	<h2 class="mx-5 font-bold underline">Hello {user.email} <IconHeart class="text-red-400" /></h2>
	<div class="flex flex-col items-center gap-3">
		<input class="border" type="text" bind:value={cashGroupName} />
		<input class="border" type="number" bind:value={cashGroupBudget} />
		<input type="checkbox" bind:value={cashGroupIsSaving} />
		<button class="rounded-lg bg-slate-100 p-2 font-poppins" on:click={saveCashGroup}
			>Create Cash Group</button
		>
	</div>
{/if}
