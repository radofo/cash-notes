<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let years: number[];
	export let months: string[];
	export let selectedMonth: number;
	export let selectedYear: number;

	const dispatch = createEventDispatcher();

	function onMonthChange(newMonth: string) {
		const monthIndex = months.indexOf(newMonth);
		dispatch('monthChanged', monthIndex);
	}
	function onYearChange(newYear: string) {
		dispatch('yearChanged', parseInt(newYear));
	}
</script>

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
