<script lang="ts">
	import { onMount } from 'svelte';

	export let inputValue: string;
	export let inputType: 'text' | 'number' | 'date' | 'password';
	export let textAlign: 'text-right' | 'text-left' = 'text-left';
	export let hint: string = '';
	export let autofocus: boolean = false;
	export let disabled: boolean = false;

	let inputRef: HTMLInputElement;

	onMount(() => {
		if (autofocus) {
			inputRef?.focus();
		}
	});

	// Handle comma input in number fields
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		if (inputType === 'number' && target.value.includes(',')) {
			// Replace comma with dot for the input validation
			inputValue = target.value.replace(',', '.');
		}
	}
</script>

{#if inputType === 'text'}
	<input
		{disabled}
		class="w-full rounded-lg border p-2 pl-3 {textAlign}"
		type="text"
		placeholder={hint}
		bind:this={inputRef}
		bind:value={inputValue}
	/>
{:else if inputType === 'number'}
	<input
		{disabled}
		bind:value={inputValue}
		step=".01"
		min="0"
		type="text"
		inputmode="decimal"
		pattern="[0-9]*[.,]?[0-9]*"
		on:input={handleInput}
		class="w-full rounded-lg border p-2 {textAlign}"
	/>
{:else if inputType === 'date'}
	<div class="relative h-[45px] w-full">
		<input
			{disabled}
			type="date"
			class="absolute bottom-0 left-0 right-0 top-0 rounded-lg border p-2 {textAlign}"
			placeholder={hint}
			bind:value={inputValue}
		/>
	</div>
{:else if inputType === 'password'}
	<input
		{disabled}
		type="password"
		class="w-full shrink rounded-lg border p-2 pl-3 {textAlign}"
		bind:value={inputValue}
	/>
{/if}
