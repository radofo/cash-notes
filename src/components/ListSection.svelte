<script lang="ts">
	import List from './List.svelte';
	export let heading: string;
</script>

<div class="flex flex-col gap-2">
	<span class="block text-center font-semibold">{heading}</span>
	<List>
		<slot />
	</List>
</div>
