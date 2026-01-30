<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let itemType: 'main' | 'sub' | 'flat' = 'flat';

	const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	on:click={() => dispatch('itemClicked')}
	class="flex w-full text-sm {itemType === 'main'
		? 'pl-1 font-medium'
		: itemType === 'flat'
		? 'pl-1'
		: 'pl-6'}  cursor-pointer items-center justify-between border-b py-2 pr-1 last-of-type:border-none"
>
	<slot />
</li>
