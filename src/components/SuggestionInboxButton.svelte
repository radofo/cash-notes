<script lang="ts">
	import { Inbox } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { suggestionCount } from '../utils/suggestion.store';

	const dispatch = createEventDispatcher<{ click: void }>();
</script>

<button
	on:click={() => dispatch('click')}
	class="fixed bottom-28 right-2 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
	aria-label="Vorschläge prüfen ({$suggestionCount})"
>
	<Inbox size={24} />
	<span
		class="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white ring-2 ring-background"
	>
		{$suggestionCount > 99 ? '99+' : $suggestionCount}
	</span>
</button>
