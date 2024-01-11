<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ButtonType } from '../types/button';

	export let variant: ButtonType = 'default';
	export let type: 'submit' | 'button' = 'button';

	const dispatch = createEventDispatcher();

	let variantClasses = 'bg-blue-100 text-blue-900';
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
			variantClasses = 'border border-slate-400 border-dashed hover:bg-slate-100';
		}
	}
</script>

<button
	{type}
	class="{variantClasses} text-md flex items-center justify-center gap-2 rounded-lg p-2 pl-3 pr-3 font-poppins font-medium leading-7"
	on:click={() => dispatch('btnclick')}><slot /></button
>
