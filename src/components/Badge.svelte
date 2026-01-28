<script lang="ts">
	export let styles: string = 'bg-muted text-foreground';
</script>

<span class="rounded-md p-2 text-xs font-semibold {styles}">
	<slot />
</span>
