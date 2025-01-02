<script lang="ts">
	import { Pie } from 'svelte-chartjs';
	import type { CategorySpendingsMeta } from '../../types/analysis';
	import InsightSection from './InsightSection.svelte';

	export let spendingsMeta: CategorySpendingsMeta;

	$: data = {
		labels: [...spendingsMeta?.keys()],
		datasets: [
			{
				data: [...spendingsMeta?.values()].map((value) => value.total),
				backgroundColor: [
					'rgba(3, 105, 161, 1)', // Primary blue
					'rgba(255, 99, 132, 0.8)', // Complementary red
					'rgba(54, 162, 235, 0.8)', // Complementary light blue
					'rgba(255, 206, 86, 0.8)', // Complementary yellow
					'rgba(75, 192, 192, 0.8)', // Complementary teal
					'rgba(153, 102, 255, 0.8)', // Complementary purple
					'rgba(255, 159, 64, 0.8)', // Complementary orange
					'rgba(255, 99, 132, 0.6)', // Lighter red
					'rgba(54, 162, 235, 0.6)', // Lighter light blue
					'rgba(255, 206, 86, 0.6)', // Lighter yellow
					'rgba(75, 192, 192, 0.6)', // Lighter teal
					'rgba(153, 102, 255, 0.6)', // Lighter purple
					'rgba(255, 159, 64, 0.6)', // Lighter orange
					'rgba(255, 99, 132, 0.4)', // Even lighter red
					'rgba(54, 162, 235, 0.4)', // Even lighter light blue
					'rgba(255, 206, 86, 0.4)', // Even lighter yellow
					'rgba(75, 192, 192, 0.4)', // Even lighter teal
					'rgba(153, 102, 255, 0.4)', // Even lighter purple
					'rgba(255, 159, 64, 0.4)', // Even lighter orange
					'rgba(255, 99, 132, 0.2)' // Lightest red
				]
			}
		]
	};
</script>

<InsightSection title="Verteilung">
	<div class="relative h-[100%] w-[100%]">
		<Pie
			{data}
			options={{
				responsive: true,
				plugins: {
					legend: {
						position: 'bottom'
					}
				}
			}}
		/>
	</div>
</InsightSection>
