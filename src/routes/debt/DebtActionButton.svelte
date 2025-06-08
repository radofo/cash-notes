<script lang="ts">
	export let clickHandler: () => void;
	export let text: string;
</script>

<button class="flex flex-col items-center gap-1 p-4" on:click={clickHandler}>
	<slot />
	<!-- <span class="text-[10px] font-medium">{text}</span> -->
</button>
