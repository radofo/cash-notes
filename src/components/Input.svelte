<script lang="ts">
	export let inputValue: string;
	export let inputType: 'text' | 'number' | 'date' | 'password';
	export let textAlign: 'text-right' | 'text-left' = 'text-left';
	export let hint: string = '';
</script>

{#if inputType === 'text'}
	<input
		class="w-full rounded-lg border p-2 pl-3 {textAlign}"
		type="text"
		placeholder={hint}
		bind:value={inputValue}
	/>
{:else if inputType === 'number'}
	<input
		bind:value={inputValue}
		step=".01"
		min="0"
		type="number"
		class="w-full rounded-lg border p-2 {textAlign}"
	/>
{:else if inputType === 'date'}
	<input
		type="date"
		class="w-full shrink rounded-lg border p-2 pl-3 {textAlign}"
		placeholder={hint}
		bind:value={inputValue}
	/>
{:else if inputType === 'password'}
	<input
		type="password"
		class="w-full shrink rounded-lg border p-2 pl-3 {textAlign}"
		bind:value={inputValue}
	/>
{/if}
