<script lang="ts">
	import { onMount } from 'svelte';

	export let inputValue: string;
	export let inputType: 'text' | 'number' | 'date' | 'password';
	export let textAlign: 'text-right' | 'text-left' = 'text-left';
	export let hint: string = '';
	export let autofocus: boolean = false;

	let inputRef: HTMLInputElement;

	onMount(() => {
		if (autofocus) {
			inputRef?.focus();
		}
	});
</script>

{#if inputType === 'text'}
	<input
		class="w-full rounded-lg border p-2 pl-3 {textAlign}"
		type="text"
		placeholder={hint}
		bind:this={inputRef}
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
