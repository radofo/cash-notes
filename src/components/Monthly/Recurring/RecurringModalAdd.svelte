<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import { insertRecCashFlow, insertRecTimeframes } from '../../../network/rec_cash_flow';
	import type { FormTimeframe } from '../../../types/recurring';
	import type { CashGroup, RecTimeframeInsert } from '../../../types/supabase';
	import { recCashFlowStore } from '../../../utils/cashGroup.store';
	import { formToInserted } from '../../../utils/recurring';
	import FormDialog from '../../FormDialog/FormDialog.svelte';
	import RecurringFormFields from './RecurringFormFields.svelte';

	export let open: boolean;

	$: supabase = $page.data.supabase;
	$: user = $page.data.session?.user;

	let modalCreateLoading: boolean = false;

	let formName = '';
	let formIsIncome = false;
	let formCashGroup: CashGroup | undefined;
	let formTimeframes: Array<FormTimeframe> = [];

	$: {
		if (!open) {
			resetModal();
		}
	}
	$: {
		if (formIsIncome) {
			formCashGroup = undefined;
		}
	}

	function resetModal() {
		formName = '';
		formIsIncome = false;
		formCashGroup = undefined;
		formTimeframes = [];
	}

	async function submitNewRecurringCashFlow() {
		if (user?.id && (formCashGroup?.id || formIsIncome) && formName && formTimeframes.length) {
			modalCreateLoading = true;
			const newRecCashFlow = await insertRecCashFlow(
				{
					cash_group_id: formCashGroup?.id,
					name: formName,
					isIncome: formIsIncome,
					owner: user.id
				},
				supabase
			);
			if (newRecCashFlow.id) {
				const timeframesToInsert = formTimeframes.map((formTimeframe): RecTimeframeInsert => {
					return formToInserted(formTimeframe, user.id, newRecCashFlow.id);
				});
				const newRecTimeframes = await insertRecTimeframes(timeframesToInsert, supabase);
				if (newRecTimeframes.length) {
					recCashFlowStore.addRecCashFlow({
						...newRecCashFlow,
						timeframes: newRecTimeframes
					});
				}
			}
			modalCreateLoading = false;
			open = false;
		}
	}
</script>

<FormDialog bind:open on:submit={submitNewRecurringCashFlow}>
	<span slot="header">Neue mtl. Zahlung</span>
	<div slot="content" class="flex h-full flex-col justify-between">
		<RecurringFormFields bind:formName bind:formCashGroup bind:formIsIncome bind:formTimeframes />
		<div class="flex flex-col gap-2">
			<Button variant="default" type="submit">
				{#if modalCreateLoading}
					<IconLoader class="animate-spin text-center" />
				{/if}
				Speichern
			</Button>
		</div>
	</div>
</FormDialog>
