<script lang="ts">
	import type { SupabaseClient, User } from '@supabase/supabase-js';
	import type { FormTimeframe } from '../types/recurring';
	import type { CashGroup, RecCashFlow } from '../types/supabase';
	import Modal from './Modal.svelte';
	import InputWithLabel from './InputWithLabel.svelte';
	import Input from './Input.svelte';
	import FullMonthSelector from './FullMonthSelector.svelte';
	import { getMonthAndYearFromDateString, getSurroundingYears, months } from '../utils/date';
	import { IconLoader, IconX } from '@tabler/icons-svelte';
	import Button from './Button.svelte';
	import {
		deleteRecCashFlow,
		deleteRecTimeframes,
		insertRecTimeframes,
		updateRecCashFlow,
		updateRecTimeframes
	} from '../network/rec_cash_flow';
	import { getRecCashFlowDiff } from '../utils/recurring';

	export let monthlyCashFlowToEdit: RecCashFlow | undefined = undefined;
	export let cashGroups: CashGroup[];
	export let showModal: boolean;
	export let user: User;
	export let supabase: SupabaseClient;
	export let updateRecCashFlowList: (updatedCashFlow: RecCashFlow) => void;
	export let removeRecCashFlow: (id: string) => void;

	let formId = '';
	let formName = '';
	let formIsIncome = false;
	let formCashGroup: CashGroup | undefined;
	let formTimeframes: Array<FormTimeframe> = [];

	let deletedTimeframes: FormTimeframe[] = [];
	let modalLoading = false;
	let modalDeleteLoading = false;
	let initialized = false;

	$: {
		if (showModal) {
			initForm();
		} else {
			resetModal();
		}
	}
	$: {
		if (formIsIncome) {
			formCashGroup = undefined;
		}
	}

	function initForm() {
		if (monthlyCashFlowToEdit && !initialized) {
			const { id, isIncome, name, timeframes, cash_group } = monthlyCashFlowToEdit;
			formId = id;
			formIsIncome = isIncome;
			formName = name;
			formCashGroup = cash_group;
			formTimeframes = timeframes.flatMap((tf) => {
				const dateNumbers = getMonthAndYearFromDateString(tf.start_date);
				if (dateNumbers) {
					return [
						{
							amount: tf.amount.toString(),
							startMonth: dateNumbers.month,
							startYear: dateNumbers.year,
							id: tf.id
						}
					];
				}
				return [];
			});
			initialized = true;
		}
	}

	function resetModal() {
		formId = '';
		formName = '';
		formIsIncome = false;
		formCashGroup = undefined;
		formTimeframes = [];
		deletedTimeframes = [];
		initialized = false;
	}

	function handleUpdate(newRecCashFlow: RecCashFlow) {
		updateRecCashFlowList(newRecCashFlow);
	}

	async function submitEditedCashFlow() {
		if (
			user?.id &&
			(formCashGroup?.id || formIsIncome) &&
			formName &&
			formId &&
			formTimeframes.length &&
			monthlyCashFlowToEdit
		) {
			modalLoading = true;
			const { cashFlowChanged, timeframeDeleted, timeframeInserted, timeframeUpdated } =
				getRecCashFlowDiff(
					user.id,
					monthlyCashFlowToEdit,
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
			handleUpdate(updatedRecCashFlow);
			showModal = false;
			modalLoading = false;
		}
	}
	async function deleteRecCashFlowHandler() {
		if (monthlyCashFlowToEdit) {
			modalDeleteLoading = true;
			await deleteRecCashFlow(monthlyCashFlowToEdit.id, supabase);
			removeRecCashFlow(monthlyCashFlowToEdit.id);
			modalDeleteLoading = false;
			showModal = false;
		}
	}
	function onCashGroupChange(newGroupName: string) {
		formCashGroup = cashGroups.find((cashGroup) => cashGroup.name === newGroupName);
	}
	function addTimeframe() {
		formTimeframes = [
			...formTimeframes,
			{ startMonth: new Date().getMonth(), startYear: new Date().getFullYear(), amount: '' }
		];
	}
	function removeTimeframe(toDelete: FormTimeframe) {
		formTimeframes = formTimeframes.filter(
			(frame) =>
				!(frame.startMonth === toDelete.startMonth && frame.startYear === toDelete.startYear)
		);
		deletedTimeframes.push(toDelete);
	}
</script>

<Modal bind:showModal>
	<h2 class="mb-3 text-center text-xl font-semibold" slot="header">
		{`Monatliche ${formIsIncome ? 'Einnahmen' : 'Ausgaben'} Bearbeiten`}
	</h2>
	<form class="flex flex-col gap-5" on:submit={submitEditedCashFlow}>
		<div class="flex flex-col gap-5">
			<InputWithLabel label="Name">
				<Input inputType="text" bind:inputValue={formName} />
			</InputWithLabel>
			<InputWithLabel label="Einnahme">
				<input type="checkbox" class="toggle-success toggle" bind:checked={formIsIncome} />
			</InputWithLabel>
			{#if !formIsIncome}
				<InputWithLabel label="Kategorie">
					<select
						on:change={(e) => onCashGroupChange(e?.currentTarget?.value)}
						class="select w-full border border-slate-200 p-2 text-base"
					>
						<option class="text-slate-500" selected={!formCashGroup?.id} disabled
							>-- Kategorie wählen --</option
						>
						{#each cashGroups as cashGroup}
							<option selected={cashGroup.id === formCashGroup?.id}>{cashGroup.name}</option>
						{/each}
					</select>
				</InputWithLabel>
			{/if}
			<div class="flex w-full flex-col gap-1">
				<div class="flex gap-1">
					<span class="w-[50%] text-sm text-slate-500"> Betrag </span>
					<span class="w-[50%] text-sm text-slate-500"> Gültig ab </span>
				</div>
				<div class="flex flex-col">
					{#each formTimeframes as timeframe}
						<div class="flex items-center gap-1 border-b py-2 last-of-type:border-0">
							<div class="w-[50%]">
								<Input inputType="text" bind:inputValue={timeframe.amount} />
							</div>
							<div class="flex w-[50%] justify-between">
								<div class="flex flex-col gap-1">
									<FullMonthSelector
										on:monthChanged={(e) => (timeframe.startMonth = e.detail)}
										on:yearChanged={(e) => (timeframe.startYear = e.detail)}
										selectedMonth={timeframe.startMonth}
										selectedYear={timeframe.startYear}
										{months}
										years={getSurroundingYears(new Date().getFullYear())}
									/>
								</div>
								<button on:click|preventDefault={() => removeTimeframe(timeframe)}>
									<IconX class="min-w-fit border-l pl-1 text-slate-500" size={24} />
								</button>
							</div>
						</div>
					{/each}
					<Button variant="dashed" on:btnclick={addTimeframe}>+</Button>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<Button variant="success" type="submit">
				{#if modalLoading}
					<IconLoader class="animate-spin text-center" />
				{/if}
				Speichern
			</Button>
			<Button variant="error" on:btnclick={deleteRecCashFlowHandler}>
				{#if modalDeleteLoading}
					<IconLoader class="animate-spin text-center" />
				{/if}
				Löschen
			</Button>
		</div>
	</form>
</Modal>
