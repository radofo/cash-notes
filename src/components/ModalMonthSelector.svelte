<script lang="ts">
	import { IconChevronDown } from '@tabler/icons-svelte';
	import { createEventDispatcher } from 'svelte';
	import { getSurroundingYears, months } from '../utils/date';
	import Button from './Button.svelte';
	import FullMonthSelector from './FullMonthSelector.svelte';
	import Modal from './Modal.svelte';

	const dispatch = createEventDispatcher();

	let showModal = false;
	let selectedMonth = new Date().getMonth();
	let selectedYear = new Date().getFullYear();

	$: {
		if (!showModal) {
			dispatch('monthChanged', { selectedMonth, selectedYear });
		}
	}

	function submitNewMonth() {
		showModal = false;
	}
</script>

<div class="flex cursor-pointer items-center gap-2">
	<button class="flex items-center text-xl font-semibold" on:click={() => (showModal = true)}>
		{months[selectedMonth]}
		{selectedYear}
		<IconChevronDown />
	</button>
	<Modal bind:showModal>
		<form on:submit={submitNewMonth} class="flex justify-center gap-4 text-lg">
			<FullMonthSelector
				on:monthChanged={(e) => (selectedMonth = e.detail)}
				on:yearChanged={(e) => (selectedYear = e.detail)}
				{selectedMonth}
				{selectedYear}
				{months}
				years={getSurroundingYears(new Date().getFullYear())}
			/>
			<Button type="submit" variant="default">Wählen</Button>
		</form>
	</Modal>
</div>
