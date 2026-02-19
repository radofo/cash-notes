<script lang="ts">
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import Button from '../Button.svelte';

	export let capturedImage: string;

	const dispatch = createEventDispatcher<{
		retake: void;
		continue: void;
		close: void;
	}>();
</script>

<div class="fixed inset-0 z-50 flex flex-col bg-black">
	<!-- Close button -->
	<button
		on:click={() => dispatch('close')}
		class="absolute left-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white"
		aria-label="Schließen"
	>
		<X size={24} />
	</button>

	<!-- Photo preview -->
	<div class="relative flex-1 overflow-hidden">
		<img src={capturedImage} alt="Aufgenommener Kassenbon" class="h-full w-full object-contain" />
	</div>

	<!-- Action buttons -->
	<div class="flex gap-3 bg-black p-4">
		<Button fullWidth variant="dashed" on:btnclick={() => dispatch('retake')}>Wiederholen</Button>
		<Button fullWidth on:btnclick={() => dispatch('continue')}>Weiter</Button>
	</div>
</div>
