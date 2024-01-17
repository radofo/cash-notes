<script lang="ts">
	import { obfuscate } from '../stores/preferences';
	export let exception = false;
</script>

<div class="relative">
	{#if $obfuscate && !exception}
		<span class="absolute bottom-0 left-0 right-0 top-0 rounded bg-white/30 p-3 backdrop-blur-sm" />
	{/if}
	<slot />
</div>
