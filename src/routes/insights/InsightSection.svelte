<script lang="ts">
	export let title: string;
</script>

<div class="flex flex-col gap-2">
	<h2 class="font-bold">{title}</h2>
	<slot />
</div>
