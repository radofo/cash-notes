<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import List from '../List.svelte';

	export let open: boolean;
</script>

<Collapsible.Root bind:open>
	<Collapsible.Trigger
		class="flex w-full flex-row items-center justify-between border-b py-2 pr-0 font-medium"
	>
		<span class="text-md flex flex-row items-center gap-2 text-start">
			{#if !open}
				<ChevronUp class="h-5 w-5" />
			{:else}
				<ChevronDown class="h-5 w-5" />
			{/if}
			<slot name="title" />
		</span>
		<div class="flex flex-row items-center gap-3">
			<slot name="total" />
		</div>
	</Collapsible.Trigger>
	<Collapsible.Content class="pl-5">
		<List>
			<slot name="content" />
			<!-- {#each inactiveCashGroups as cashGroup}
				<ListItem on:itemClicked={() => openCashGroupEditModal?.(cashGroup)} itemType="main">
					<span class="border border-white border-opacity-0">
						{cashGroup.name}
					</span>
					<div class="relative flex items-center">
						<span class="">{displayCurrency({ amount: cashGroup.budget })}</span>
					</div>
				</ListItem>
			{/each} -->
		</List>
	</Collapsible.Content>
</Collapsible.Root>
