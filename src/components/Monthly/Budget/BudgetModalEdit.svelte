<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
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

<Drawer.Root bind:open>
	<Drawer.Content class="h-[95%]">
		<Drawer.Header>
			<Drawer.Title>Budget bearbeiten</Drawer.Title>
		</Drawer.Header>
		<div class="flex h-full w-full items-center justify-center">
			<form
				class="flex h-full w-[500px] max-w-full flex-col justify-between gap-5 p-2 pb-10"
				on:submit={updateCashGroupHandler}
			>
				<div class="flex flex-col gap-3">
					<InputWithLabel label="Name">
						<Input inputType="text" bind:inputValue={editBudgetName} />
					</InputWithLabel>
					<InputWithLabel label="Budget Betrag (optional)">
						<Input inputType="number" bind:inputValue={editBudgetAmount} />
					</InputWithLabel>
				</div>
				<Drawer.Footer class="flex flex-col gap-2 p-0">
					<Button type="submit">
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
							class="flex flex-row gap-2"
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
					<Drawer.Close class="p-2 text-sm">Abbrechen</Drawer.Close>
				</Drawer.Footer>
			</form>
		</div>
	</Drawer.Content>
</Drawer.Root>
