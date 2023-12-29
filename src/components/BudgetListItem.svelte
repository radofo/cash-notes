<script lang="ts">
	import type { CashGroup } from '../types/supabase';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let cashGroup: CashGroup;
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	on:click={() => dispatch('itemClicked', cashGroup)}
	class="flex w-full cursor-pointer items-center justify-between border-b py-3 last:border-0 hover:bg-slate-50"
>
	<span class="border border-white border-opacity-0 text-lg">{cashGroup?.name}</span>
	<div class="flex items-center">
		<span class="pr-3 text-lg">{cashGroup?.budget}€</span>
	</div>
</li>
