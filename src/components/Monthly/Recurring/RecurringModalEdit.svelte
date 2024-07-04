<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import {
		deleteRecCashFlow,
		deleteRecTimeframes,
		insertRecTimeframes,
		updateRecCashFlow,
		updateRecTimeframes
	} from '../../../network/rec_cash_flow';
	import type { FormTimeframe } from '../../../types/recurring';
	import type { CashGroup, RecCashFlow } from '../../../types/supabase';
	import { recCashFlowStore } from '../../../utils/cashGroup.store';
	import { getMonthAndYearFromDateString } from '../../../utils/date';
	import { getRecCashFlowDiff } from '../../../utils/recurring';
	import FormDialog from '../../FormDialog.svelte';
	import RecurringFormFields from './RecurringFormFields.svelte';

	export let recurringToEdit: RecCashFlow | undefined = undefined;
	export let open: boolean;

	$: supabase = $page.data.supabase;
	$: user = $page.data.session?.user;

	let modalUpdateLoading: boolean = false;
	let modalDeleteLoading: boolean = false;

	let formId = '';
	let formName = '';
	let formIsIncome = false;
	let formCashGroup: CashGroup | undefined;
	let formTimeframes: Array<FormTimeframe> = [];
	let deletedTimeframes: FormTimeframe[] = [];

	$: {
		if (open) {
			initModal();
		} else {
			resetModal();
		}
	}
	$: {
		if (formIsIncome) {
			formCashGroup = undefined;
		}
	}

	function resetModal() {
		formId = '';
		formName = '';
		formIsIncome = false;
		formCashGroup = undefined;
		formTimeframes = [];
		deletedTimeframes = [];
	}

	async function initModal() {
		if (recurringToEdit) {
			const { id, isIncome, name, timeframes, cash_group } = recurringToEdit;
			formId = id;
			formIsIncome = isIncome;
			formName = name;
			formCashGroup = cash_group;
			formTimeframes = timeframes.flatMap((tf) => {
				const dateNumbers = getMonthAndYearFromDateString(tf.start_date);
				if (dateNumbers) {
					return [
						{
							amount: tf.amount !== null && tf.amount !== undefined ? tf.amount.toString() : '',
							startMonth: dateNumbers.month,
							startYear: dateNumbers.year,
							id: tf.id
						}
					];
				}
				return [];
			});
		}
	}

	async function submitEditedCashFlow() {
		if (
			user?.id &&
			(formCashGroup?.id || formIsIncome) &&
			formName &&
			formId &&
			formTimeframes.length &&
			recurringToEdit
		) {
			modalUpdateLoading = true;
			const { cashFlowChanged, timeframeDeleted, timeframeInserted, timeframeUpdated } =
				getRecCashFlowDiff(
					user.id,
					recurringToEdit,
					formName,
					formIsIncome,
					formTimeframes,
					formCashGroup?.id
				);
			if (
				!timeframeInserted.length &&
				!timeframeDeleted.length &&
				!timeframeUpdated.length &&
				!cashFlowChanged
			) {
				modalUpdateLoading = false;
				open = false;
				return;
			}
			if (timeframeInserted.length) {
				await insertRecTimeframes(timeframeInserted, supabase);
			}
			if (timeframeUpdated.length) {
				await updateRecTimeframes(timeframeUpdated, supabase);
			}
			if (timeframeDeleted.length) {
				await deleteRecTimeframes(timeframeDeleted, supabase);
			}
			const updatedRecCashFlow = await updateRecCashFlow(
				{
					id: formId,
					cash_group_id: formCashGroup?.id,
					name: formName,
					isIncome: formIsIncome
				},
				supabase
			);
			if (updatedRecCashFlow) {
				recCashFlowStore.updateRecCashFlows(updatedRecCashFlow);
				open = false;
			}
			modalUpdateLoading = false;
		}
	}

	async function deleteRecCashFlowHandler() {
		if (recurringToEdit) {
			modalDeleteLoading = true;
			const wasDeleteSuccess = await deleteRecCashFlow(recurringToEdit.id, supabase);
			if (wasDeleteSuccess) {
				recCashFlowStore.removeRecCashFlow(recurringToEdit.id);
				open = false;
			}
			modalDeleteLoading = false;
		}
	}
</script>

<FormDialog bind:open on:submit={submitEditedCashFlow}>
	<span slot="header">Mtl. Zahlung bearbeiten</span>
	<div slot="content">
		<div class="flex flex-col gap-6">
			<RecurringFormFields
				bind:formName
				bind:formCashGroup
				bind:formIsIncome
				bind:formTimeframes
				bind:deletedTimeframes
			/>
			<div>
				<div class="flex flex-col gap-2">
					<Button variant="default" type="submit">
						{#if modalUpdateLoading}
							<IconLoader class="animate-spin text-center" />
						{/if}
						Speichern
					</Button>
					<Button variant="destructive" type="button" on:click={deleteRecCashFlowHandler}>
						{#if modalDeleteLoading}
							<IconLoader class="animate-spin text-center" />
						{/if}
						Löschen
					</Button>
				</div>
			</div>
		</div>
	</div>
</FormDialog>
