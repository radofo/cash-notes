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
	import Button from '../../components/Button.svelte';
	import Modal from '../../components/Modal.svelte';
	import InputWithLabel from '../../components/InputWithLabel.svelte';
	import Input from '../../components/Input.svelte';
	import { IconLoader } from '@tabler/icons-svelte';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let cashGroups: CashGroup[] = [];
	let showModal: boolean = false;
	let loading: boolean = false;
	let modalLoading: boolean = false;
	let modalDeleteLoading: boolean = false;

	let editBudgetName = '';
	let editBudgetAmount = '';
	let editBudgetId = '';

	onMount(async () => {
		loading = true;
		cashGroups = await getCashGroups(supabase);
		loading = false;
	});

	$: {
		if (!showModal) {
			resetModal();
		}
	}

	function resetModal() {
		editBudgetAmount = '';
		editBudgetId = '';
		editBudgetName = '';
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
				cashGroups = [...cashGroups, newCashGroup];
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
				cashGroups = cashGroups.filter((cashGroup) => cashGroup.id !== editBudgetId);
			}
		}
		modalDeleteLoading = false;
		showModal = false;
	}

	function openModalInEditMode(cashGroup: CashGroup) {
		editBudgetName = cashGroup.name;
		editBudgetAmount = cashGroup.budget?.toString() ?? '';
		editBudgetId = cashGroup.id;
		showModal = true;
	}
</script>

{#if user}
	<DefaultPageContent>
		<div class="flex w-full flex-col items-center gap-2 px-4 sm:w-[500px]">
			<H1>Kategorien</H1>
			<div class="mt-9 flex w-full flex-col gap-5">
				<Button variant="success" on:btnclick={() => (showModal = true)}>Neue Kategorie</Button>
				{#if loading}
					<div class="mt-10 grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else if !cashGroups.length}
					<div class="mt-8 text-center">Noch keine Kategorie erstellt</div>
				{:else}
					<ul class="w-full list-none">
						{#each cashGroups as cashGroup}
							<BudgetListItem on:itemClicked={(e) => openModalInEditMode(e.detail)} {cashGroup} />
						{/each}
					</ul>
				{/if}
			</div>
		</div>
		<Modal bind:showModal>
			<h2 class="mb-3 text-center text-xl font-semibold" slot="header">
				{editBudgetId ? 'Budget Bearbeiten' : 'Budget Erstellen'}
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
	</DefaultPageContent>
{/if}
