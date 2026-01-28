<script lang="ts">
	export let label: string;
</script>

<div class="flex flex-col gap-1">
	<span class="text-sm text-muted-foreground">{label}</span>
	<slot />
</div>
