<script lang="ts">
	import { getSurroundingYears } from '../utils/date';
	import { createEventDispatcher } from 'svelte';
	import Modal from './Modal.svelte';
	import { IconChevronDown } from '@tabler/icons-svelte';

	const dispatch = createEventDispatcher();

	const months = [
		'Januar',
		'Februar',
		'März',
		'April',
		'Mai',
		'Juni',
		'Juli',
		'August',
		'September',
		'Oktober',
		'November',
		'Dezember'
	];
	const years = getSurroundingYears(new Date().getFullYear());
	let showModal = false;

	let selectedMonth = new Date().getMonth();
	let selectedYear = new Date().getFullYear();

	$: {
		if (!showModal) {
			dispatch('monthChanged', { selectedMonth, selectedYear });
		}
	}

	function onMonthChange(newMonth: string) {
		const newMonthIndex = months.indexOf(newMonth);
		if (newMonthIndex > -1) {
			selectedMonth = newMonthIndex;
		}
	}
	function onYearChange(newYear: string) {
		selectedYear = Number.parseInt(newYear);
	}
</script>

<div class="flex cursor-pointer items-center gap-2">
	<button class="flex items-center text-2xl font-medium" on:click={() => (showModal = true)}>
		{months[selectedMonth]}
		{selectedYear}
		<IconChevronDown />
	</button>
	<Modal bind:showModal>
		<form class="flex justify-center gap-2 text-lg">
			<select on:change={(e) => onMonthChange(e?.currentTarget?.value)}>
				{#each months as month, index}
					<option selected={index === selectedMonth}>{month}</option>
				{/each}
			</select>
			<select on:change={(e) => onYearChange(e?.currentTarget?.value)}>
				{#each years as year}
					<option selected={year === selectedYear}>{year}</option>
				{/each}
			</select>
		</form>
	</Modal>
</div>
