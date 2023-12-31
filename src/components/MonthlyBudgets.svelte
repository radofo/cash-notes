<script lang="ts">
	import type { CashFlow, CashGroup } from '../types/supabase';

	export let cashGroups: CashGroup[];
	export let cashFlows: CashFlow[];
	let progress: Map<string, { spent: number; limit: number }>;

	$: {
		const newProgress = new Map<string, { spent: number; limit: number }>();
		for (const cashFlow of cashFlows) {
			const cashGroup = cashFlow.cash_group;
			if (!cashGroup) continue;

			const cashGroupName = cashGroup.name;

			if (cashGroupName) {
				const alreadySpent = newProgress.get(cashGroupName ?? '')?.spent ?? 0;
				newProgress.set(cashGroupName, {
					limit: cashGroup.budget,
					spent: alreadySpent + cashFlow.amount
				});
			}
		}
		for (const cashGroup of cashGroups) {
			if (!newProgress.has(cashGroup.name)) {
				newProgress.set(cashGroup.name, { spent: 0, limit: cashGroup.budget });
			}
		}
		progress = newProgress;
	}
</script>

<ul class="flex flex-col gap-4">
	{#each [...progress] as [name, info]}
		<li class="flex flex-col">
			<div class="flex flex-row justify-between">
				<span>{name}</span>
				<span>{info.spent} / {info.limit}</span>
			</div>
			<progress
				class="progress-info progress w-full bg-slate-200"
				value={Math.max(0, info.spent / info.limit) * 100}
				max="100"
			/>
		</li>
	{/each}
</ul>
