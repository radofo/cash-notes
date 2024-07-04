<script lang="ts">
	export let selected: boolean = false;
	export let onClick: () => void;
</script>

<button
	on:click={() => onClick()}
	class:bg-card={selected}
	class:text-card-foreground={selected}
	class="flex flex-1 items-center justify-center rounded p-2 text-center text-muted-foreground"
>
	<slot />
</button>
