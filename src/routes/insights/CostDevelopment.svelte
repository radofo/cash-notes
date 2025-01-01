<script lang="ts">
	import { Line } from 'svelte-chartjs';

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
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				borderColor: 'rgba(255, 99, 132, 1)',
				borderWidth: 1,
				data: dataPoints
			}
		]
	};
</script>

<div class="relative h-[100%] w-[100%]">
	<Line
		options={{
			responsive: true,
			locale: 'de-DE',
			scales: { y: { suggestedMin: min, suggestedMax: max } },
			plugins: {
				legend: { display: false }
				// title: { display: true, text: 'Kostenentwicklung' }
			}
		}}
		class=""
		width="100%"
		{data}
	/>
</div>
