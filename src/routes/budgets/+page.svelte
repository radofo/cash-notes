<script lang="ts">
	import type { CashGroup, InsertCashGroupDTO, UpdateCashGroupDTO } from '../../supabaseTypes';
	import {
		deleteCashGroup,
		getAllUserCashGroups,
		insertCashGroup,
		updateCashGroup
	} from '../../network/cash_group';
	import type { PageData } from '../cash-group/$types';
	import { onMount } from 'svelte';
	import BudgetListItem from '../../components/BudgetListItem.svelte';
	import BudgetListItemEdit from '../../components/BudgetListItemEdit.svelte';
	import BudgetListItemCreate from '../../components/BudgetListItemCreate.svelte';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let cashGroups: CashGroup[] = [];
	let rowInEditMode: string = '';

	onMount(async () => {
		cashGroups = await getAllUserCashGroups(supabase);
	});

	async function updateCashGroupHandler(dto: UpdateCashGroupDTO) {
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

	async function insertCashGroupHandler({ budget, name }: InsertCashGroupDTO) {
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
	<div class="flex flex-col items-center gap-20 font-poppins">
		<h1 class="text-6xl font-semibold text-slate-800">Budgets</h1>
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
	</div>
{/if}
