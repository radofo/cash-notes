<script lang="ts">
	import { IconLoader, IconPencil, IconX } from '@tabler/icons-svelte';
	import type { CashFlow } from '../types/supabase';

	export let cashFlow: CashFlow;
	export let deleteCashFlow: (id: string) => Promise<void>;
	export let editCashFlow: (id: string) => Promise<void>;

	let deleteLoading: boolean = false;
</script>

<li class="flex items-center justify-between border-b p-2 last:border-0">
	<div class="flex justify-stretch gap-4">
		<span class="grid place-items-center rounded-lg border border-dashed p-2 text-lg"
			>{new Date(cashFlow.date).getDate()}</span
		>
		<div class="flex flex-col">
			<span class="text-lg">
				{cashFlow.name}
			</span>
			<span class="text-slate-500">{cashFlow.cash_group?.name ?? 'Sonstige'}</span>
		</div>
	</div>
	<div class="flex items-center">
		<span class="pr-3 text-lg">
			{cashFlow.amount} €
		</span>
		<div class="flex gap-1 border-l pl-3">
			<button
				on:click={async () => {
					editCashFlow(cashFlow.id);
				}}
			>
				<IconPencil class="text-slate-900 hover:cursor-pointer hover:text-blue-800" />
			</button>
			<button
				on:click={async () => {
					deleteLoading = true;
					await deleteCashFlow(cashFlow.id);
					deleteLoading = false;
				}}
			>
				{#if deleteLoading}
					<IconLoader class="animate-spin" />
				{:else}
					<IconX class="hover:text-red-800" />
				{/if}
			</button>
		</div>
	</div>
</li>
