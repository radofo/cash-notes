<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import {
		activateCashGroup,
		deactivateCashGroup,
		deleteCashGroup,
		hasCashGroupElements,
		updateCashGroup
	} from '../../../network/cash_group';
	import type { CashGroup } from '../../../types/supabase';
	import { cashGroupStore } from '../../../utils/cashGroup.store';
	import FormDialog from '../../FormDialog/FormDialog.svelte';
	import Input from '../../Input.svelte';
	import InputWithLabel from '../../InputWithLabel.svelte';

	export let budgetToEdit: CashGroup | undefined;
	export let open: boolean;

	$: supabase = $page.data.supabase;

	let modalUpdateLoading: boolean = false;
	let modalActivationLoading: boolean = false;

	let editBudgetName = '';
	let editBudgetAmount = '';
	let editBudgetId = '';
	let hasBudgetReferences = true;

	$: {
		if (open) {
			initModal();
		} else {
			resetModal();
		}
	}

	function resetModal() {
		editBudgetAmount = '';
		editBudgetId = '';
		editBudgetName = '';
		hasBudgetReferences = true;
	}

	async function initModal() {
		if (budgetToEdit) {
			const { budget, name, id } = budgetToEdit;
			editBudgetAmount = budget?.toString() ?? '';
			editBudgetName = name;
			editBudgetId = id;
			hasBudgetReferences = await hasCashGroupElements(id, supabase);
		}
	}

	async function updateCashGroupHandler() {
		modalUpdateLoading = true;
		if (parseFloat(editBudgetAmount) < 0) {
			modalUpdateLoading = false;
			return;
		}
		const updatedCashGroup = await updateCashGroup(
			{
				budget: editBudgetAmount === '' ? null : editBudgetAmount,
				name: editBudgetName,
				id: editBudgetId
			},
			supabase
		);
		if (updatedCashGroup) {
			cashGroupStore.updateCashGroups(updatedCashGroup);
		}
		modalUpdateLoading = false;
		open = false;
	}

	async function deactivateCashGroupHandler() {
		modalActivationLoading = true;
		if (editBudgetId) {
			const updatedCashGroup = await deactivateCashGroup(editBudgetId, supabase);
			if (updatedCashGroup) {
				cashGroupStore.updateCashGroups(updatedCashGroup);
				open = false;
			}
		}
		modalActivationLoading = false;
	}

	async function activateCashGroupHandler() {
		modalActivationLoading = true;
		if (editBudgetId) {
			const updatedCashGroup = await activateCashGroup(editBudgetId, supabase);
			if (updatedCashGroup) {
				cashGroupStore.updateCashGroups(updatedCashGroup);
				open = false;
			}
		}
		modalActivationLoading = false;
	}

	async function deleteCashGroupHandler() {
		modalActivationLoading = true;
		if (editBudgetId) {
			const wasDeleteSuccess = await deleteCashGroup(editBudgetId, supabase);
			if (wasDeleteSuccess) {
				cashGroupStore.removeCashGroup(editBudgetId);
				open = false;
			}
		}
		modalActivationLoading = false;
	}
</script>

<FormDialog bind:open on:submit={updateCashGroupHandler}>
	<span slot="header">Budget Editieren</span>
	<div slot="content" class="flex h-full flex-col justify-between">
		<div class="flex flex-col gap-3">
			<InputWithLabel label="Name">
				<Input inputType="text" bind:inputValue={editBudgetName} />
			</InputWithLabel>
			<InputWithLabel label="Budget Betrag (optional)">
				<Input inputType="number" bind:inputValue={editBudgetAmount} />
			</InputWithLabel>
		</div>
		<div class="flex flex-col gap-2 p-0">
			<Button class="py-6" type="submit">
				{#if modalUpdateLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center text-lg" />
					</div>
				{:else}
					Speichern
				{/if}
			</Button>
			{#if budgetToEdit?.is_active}
				<Button
					class="flex flex-row gap-2 py-6"
					variant="destructive"
					on:click={() => {
						if (hasBudgetReferences) {
							deactivateCashGroupHandler();
						} else {
							deleteCashGroupHandler();
						}
					}}
					type="button"
				>
					{#if modalActivationLoading}
						<div class="grid place-items-center">
							<IconLoader class="animate-spin text-center text-lg" />
						</div>
					{/if}
					{#if hasBudgetReferences}
						Budget Deaktivieren
					{:else}
						Löschen
					{/if}
				</Button>
			{:else}
				<Button variant="secondary" on:click={activateCashGroupHandler} type="button">
					{#if modalActivationLoading}
						<div class="grid place-items-center">
							<IconLoader class="animate-spin text-center text-lg" />
						</div>
					{/if}
					Budget Aktivieren
				</Button>
			{/if}
			<!-- <Drawer.Close class="p-2 text-sm">Abbrechen</Drawer.Close> -->
		</div>
	</div>
</FormDialog>
