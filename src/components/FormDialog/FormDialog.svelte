<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;

	const dispatch = createEventDispatcher();

	function handleSubmit() {
		dispatch('submit');
	}
</script>

<div
	class="{open ? 'fixed' : 'hidden'} bottom-0 left-0 right-0 top-0 z-50 flex flex-col bg-white p-4"
>
	<div class="flex h-full flex-col gap-8">
		<div class="flex w-full flex-row items-center justify-between">
			<h1 class="text-lg font-bold">
				<slot name="header" />
			</h1>
			<Button class="p-1" variant="ghost" on:click={() => (open = false)}>
				<X />
			</Button>
		</div>
		<form class="flex-grow pb-4" on:submit={handleSubmit}>
			<slot name="content" />
		</form>
	</div>
</div>
