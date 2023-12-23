<script lang="ts">
	export let inputValue: string;
	export let inputType: 'text' | 'number';
	export let hint: string = '';
</script>

{#if inputType === 'text'}
	<input
		class="w-full shrink rounded-lg border p-2 pl-3 text-lg"
		type="text"
		placeholder={hint}
		bind:value={inputValue}
	/>
{:else if inputType === 'number'}
	<input
		class="w-full shrink rounded-lg border p-2 text-right text-lg"
		type="text"
		placeholder={hint}
		bind:value={inputValue}
	/>
{/if}
