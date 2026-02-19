<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ButtonType } from '../types/button';

	export let variant: ButtonType = 'default';
	export let type: 'submit' | 'button' = 'button';
	export let fullWidth: boolean = false;
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher();

	let variantClasses = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100';
	switch (variant) {
		case 'success': {
			variantClasses = 'bg-green-100 text-green-900';
			break;
		}
		case 'error': {
			variantClasses = 'bg-red-100 text-red-900';
			break;
		}
		case 'dashed': {
			variantClasses = 'border border-interactive border-dashed hover:bg-surface-hover';
		}
	}
</script>

<button
	{type}
	{disabled}
	class="{variantClasses} {fullWidth
		? 'flex-1'
		: 'flex-shrink'} text-md flex items-center justify-center gap-2 rounded-lg p-2 pl-3 pr-3 font-poppins font-medium leading-7 disabled:cursor-not-allowed disabled:opacity-50"
	on:click={() => dispatch('btnclick')}><slot /></button
>
