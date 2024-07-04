<script lang="ts">
	import ListTotal from '../ListTotal.svelte';

	export let totalSpendings: number;
	export let totalEarnings: number;
	export let fixCost: number;
	export let budgetedCost: number;
	export let savings: number;
</script>

<ListTotal {budgetedCost} {fixCost} {totalEarnings} {totalSpendings} {savings} />
