<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import InsightSection from './InsightSection.svelte';

	export let labels: string[];
	export let dataPoints: number[];

	$: minData = Math.min(...dataPoints);
	$: maxData = Math.max(...dataPoints);
	$: min = Math.max(minData - minData * 0.1, 0);
	$: max = Math.max(maxData + maxData * 0.1, 1);

	$: data = {
		labels,
		datasets: [
			{
				backgroundColor: 'rgba(3, 105, 161, 0.2)',
				borderColor: 'rgba(3, 105, 161, 1)',
				borderWidth: 1,
				data: dataPoints,
				fill: true
			}
		]
	};
</script>

<InsightSection title="Verlauf">
	<div class="relative h-[100%] w-[100%]">
		<Line
			options={{
				responsive: true,
				locale: 'de-DE',
				scales: { y: { suggestedMin: min, suggestedMax: max } },
				plugins: {
					legend: { display: false }
					// title: { display: true, text: 'Ausgaben 2024 - Gesamt' }
				}
			}}
			class=""
			width="100%"
			{data}
		/>
	</div>
</InsightSection>
