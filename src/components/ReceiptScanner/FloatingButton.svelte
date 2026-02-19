<script lang="ts">
	import { Camera } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		click: void;
	}>();
</script>

<button
	on:click={() => dispatch('click')}
	class="fixed bottom-28 right-2 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
	aria-label="Kassenbon scannen"
>
	<Camera size={24} />
</button>
