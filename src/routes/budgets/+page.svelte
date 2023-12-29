<script lang="ts">
	import type { CashGroup, CashGroupInsert, CashGroupUpdate } from '../../types/supabase';
	import {
		deleteCashGroup,
		getCashGroups,
		insertCashGroup,
		updateCashGroup
	} from '../../network/cash_group';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import BudgetListItem from '../../components/BudgetListItem.svelte';
	import BudgetListItemCreate from '../../components/BudgetListItemCreate.svelte';
	import DefaultPageContent from '../../components/DefaultPageContent.svelte';
	import H1 from '../../components/H1.svelte';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let cashGroups: CashGroup[] = [];
	let rowInEditMode: string = '';

	onMount(async () => {
		cashGroups = await getCashGroups(supabase);
	});

	async function updateCashGroupHandler(dto: CashGroupUpdate) {
		const updatedCashGroup = await updateCashGroup(dto, supabase);
		if (updatedCashGroup) {
			cashGroups = cashGroups.map((cashGroup) => {
				if (cashGroup.id === updatedCashGroup.id) {
					return {
						...cashGroup,
						...updatedCashGroup
					};
				}
				return cashGroup;
			});
		}
		rowInEditMode = '';
	}

	async function insertCashGroupHandler({ budget, name }: CashGroupInsert) {
		if (user?.id) {
			const newCashGroup = await insertCashGroup(
				{
					budget,
					name,
					owner: user?.id
				},
				supabase
			);
			if (newCashGroup) {
				cashGroups = [...cashGroups, newCashGroup];
			}
		}
	}

	async function deleteCashGroupHandler(id: string) {
		const wasDeleteSuccess = await deleteCashGroup(id, supabase);
		if (wasDeleteSuccess) {
			cashGroups = cashGroups.filter((cashGroup) => cashGroup.id !== id);
		}
	}

	function setIsEditing(newInEdit: string) {
		rowInEditMode = newInEdit;
	}
</script>

{#if user}
	<DefaultPageContent>
		<H1>Budgets</H1>
		<ul class="w-[500px] max-w-[90%] list-none [&>*:first-child]:mb-3">
			<BudgetListItemCreate {user} insertCashGroup={insertCashGroupHandler} />
			{#each cashGroups as cashGroup}
				<BudgetListItem
					isEditing={rowInEditMode === cashGroup.id}
					{setIsEditing}
					updateCashGroup={updateCashGroupHandler}
					deleteCashGroup={deleteCashGroupHandler}
					{cashGroup}
				/>
			{/each}
		</ul>
	</DefaultPageContent>
{/if}
