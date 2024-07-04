<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import { IconLoader } from '@tabler/icons-svelte';
	import { insertCashGroup } from '../../../network/cash_group';
	import { cashGroupStore } from '../../../utils/cashGroup.store';
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

<Drawer.Root bind:open>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>Neues Budget</Drawer.Title>
		</Drawer.Header>
		<div class="flex h-full w-full items-center justify-center">
			<form
				class="flex h-full w-[500px] max-w-full flex-col justify-between gap-5 p-2 pb-10"
				on:submit={insertCashGroupHandler}
			>
				<div class="flex flex-col gap-3">
					<InputWithLabel label="Name">
						<Input inputType="text" bind:inputValue={newBudgetName} />
					</InputWithLabel>
					<InputWithLabel label="Budget Betrag (optional)">
						<Input inputType="number" bind:inputValue={newBudgetAmount} />
					</InputWithLabel>
				</div>
				<Drawer.Footer class="flex flex-col gap-2 p-0">
					<Button type="submit">
						{#if modalCreateLoading}
							<div class="grid place-items-center">
								<IconLoader class="animate-spin text-center text-lg" />
							</div>
						{:else}
							Speichern
						{/if}
					</Button>
					<Drawer.Close class="p-2 text-sm">Abbrechen</Drawer.Close>
				</Drawer.Footer>
			</form>
		</div>
	</Drawer.Content>
</Drawer.Root>
