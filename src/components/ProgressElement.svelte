<script lang="ts">
	import type { BudgetProgress } from '../types/budget';

	export let name: string;
	export let info: BudgetProgress;
</script>

<li class="flex flex-col">
	<div class="flex flex-row justify-between">
		<span>{name}</span>
		<span>{info.spent} {info.limit ? `/ ${info.limit}` : ''}</span>
	</div>
	<progress
		class="progress-success progress w-full bg-slate-200 {info.limit ? '' : 'opacity-30'}"
		value={(info?.limit ?? 0) > 0 ? Math.max(0, info.spent / (info.limit ?? 0)) * 100 : 100}
		max="100"
	/>
</li>
