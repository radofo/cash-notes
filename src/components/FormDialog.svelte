<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;

	const dispatch = createEventDispatcher();

	function handleSubmit() {
		dispatch('submit');
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				<slot name="header" />
			</Dialog.Title>
		</Dialog.Header>
		<form class="flex flex-col p-2 pb-2" on:submit={handleSubmit}>
			<slot name="content" />
		</form>
	</Dialog.Content>
</Dialog.Root>
