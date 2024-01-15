<script lang="ts">
	import type { SupabaseClient, User } from '@supabase/supabase-js';
	import type { CashGroup } from '../types/supabase';
	import Modal from './Modal.svelte';
	import { deleteCashGroup, insertCashGroup, updateCashGroup } from '../network/cash_group';
	import InputWithLabel from './InputWithLabel.svelte';
	import Input from './Input.svelte';
	import Button from './Button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';

	export let user: User;
	export let supabase: SupabaseClient;
	export let showModal: boolean;
	export let budgetToEdit: CashGroup | undefined;
	export let updateCashGroups: (newCashGroups: CashGroup[]) => void;
	export let cashGroups: CashGroup[];

	let modalLoading: boolean = false;
	let initialized = false;
	let modalDeleteLoading: boolean = false;

	let editBudgetName = '';
	let editBudgetAmount = '';
	let editBudgetId = '';

	$: {
		if (showModal) {
			initModal();
		} else {
			resetModal();
		}
	}

	function resetModal() {
		editBudgetAmount = '';
		editBudgetId = '';
		editBudgetName = '';
	}

	function initModal() {
		if (budgetToEdit && !initialized) {
			const { budget, name, id } = budgetToEdit;
			editBudgetAmount = budget?.toString() ?? '';
			editBudgetName = name;
			editBudgetId = id;
		}
	}

	async function updateCashGroupHandler() {
		modalLoading = true;
		const updatedCashGroup = await updateCashGroup(
			{
				budget: editBudgetAmount === '' ? null : editBudgetAmount,
				name: editBudgetName,
				id: editBudgetId
			},
			supabase
		);
		if (updatedCashGroup) {
			const newCashGroups = cashGroups.map((cashGroup) => {
				if (cashGroup.id === updatedCashGroup.id) {
					return {
						...cashGroup,
						...updatedCashGroup
					};
				}
				return cashGroup;
			});
			updateCashGroups(newCashGroups);
		}
		modalLoading = false;
		showModal = false;
	}

	async function insertCashGroupHandler() {
		modalLoading = true;
		if (user?.id) {
			const newCashGroup = await insertCashGroup(
				{
					budget: editBudgetAmount === '' ? null : editBudgetAmount,
					name: editBudgetName,
					owner: user?.id
				},
				supabase
			);
			if (newCashGroup) {
				const newCashGroups = [...cashGroups, newCashGroup];
				updateCashGroups(newCashGroups);
			}
		}
		modalLoading = false;
		showModal = false;
	}

	async function deleteCashGroupHandler() {
		modalDeleteLoading = true;
		if (editBudgetId) {
			const wasDeleteSuccess = await deleteCashGroup(editBudgetId, supabase);
			if (wasDeleteSuccess) {
				const newCashGroups = cashGroups.filter((cashGroup) => cashGroup.id !== editBudgetId);
				updateCashGroups(newCashGroups);
			}
		}
		modalDeleteLoading = false;
		showModal = false;
	}
</script>

<Modal bind:showModal>
	<h2 class="mb-3 text-center text-xl font-semibold" slot="header">
		{editBudgetId ? 'Kategorie Bearbeiten' : 'Kategorie Erstellen'}
	</h2>
	<form
		class="flex flex-col gap-5"
		on:submit={editBudgetId ? updateCashGroupHandler : insertCashGroupHandler}
	>
		<div class="flex flex-col gap-3">
			<InputWithLabel label="Name">
				<Input inputType="text" bind:inputValue={editBudgetName} />
			</InputWithLabel>
			<InputWithLabel label="Budget (optional)">
				<Input inputType="number" bind:inputValue={editBudgetAmount} />
			</InputWithLabel>
		</div>
		<div class="flex flex-col gap-2">
			<Button variant="success" type="submit">
				{#if modalLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center text-lg" />
					</div>
				{:else}
					Speichern
				{/if}
			</Button>
			{#if editBudgetId}
				<Button on:btnclick={() => deleteCashGroupHandler()} variant="error" type="button">
					{#if modalDeleteLoading}
						<div class="grid place-items-center">
							<IconLoader class="animate-spin text-center text-lg" />
						</div>
					{:else}
						Löschen
					{/if}
				</Button>
			{/if}
		</div>
	</form>
</Modal>
