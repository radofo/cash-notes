<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import { insertCashGroup } from '../../../network/cash_group';
	import { cashGroupStore } from '../../../utils/cashGroup.store';
	import FormDialog from '../../FormDialog/FormDialog.svelte';
	import Input from '../../Input.svelte';
	import InputWithLabel from '../../InputWithLabel.svelte';

	export let open: boolean;

	$: supabase = $page.data.supabase;
	$: user = $page.data.session.user;

	let modalCreateLoading: boolean = false;

	let newBudgetName = '';
	let newBudgetAmount = '';

	$: {
		if (!open) {
			resetModal();
		}
	}

	function resetModal() {
		newBudgetAmount = '';
		newBudgetName = '';
	}

	async function insertCashGroupHandler() {
		modalCreateLoading = true;
		if (parseFloat(newBudgetAmount) < 0 || newBudgetName === '' || !user) {
			modalCreateLoading = false;
			return;
		}
		const insertedCashGroup = await insertCashGroup(
			{
				budget: newBudgetAmount === '' ? null : newBudgetAmount,
				name: newBudgetName,
				owner: user.id
			},
			supabase
		);
		if (insertedCashGroup) {
			cashGroupStore.insertCashGroup(insertedCashGroup);
			open = false;
		}
		modalCreateLoading = false;
	}
</script>

<FormDialog bind:open on:submit={insertCashGroupHandler}>
	<span slot="header">Neues Budget Erstellen</span>
	<div slot="content" class="flex h-full flex-col justify-between">
		<div class="flex flex-col gap-3">
			<InputWithLabel label="Name">
				<Input inputType="text" bind:inputValue={newBudgetName} />
			</InputWithLabel>
			<InputWithLabel label="Budget Betrag (optional)">
				<Input inputType="number" bind:inputValue={newBudgetAmount} />
			</InputWithLabel>
		</div>
		<div class="flex flex-col gap-2 p-0">
			<Button type="submit">
				{#if modalCreateLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center text-lg" />
					</div>
				{:else}
					Speichern
				{/if}
			</Button>
		</div>
	</div>
</FormDialog>
