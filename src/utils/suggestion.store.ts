import type { SupabaseClient } from '@supabase/supabase-js';
import { derived, writable } from 'svelte/store';
import { getSuggestions } from '../network/cash_flow_suggestion';
import type { CashFlowSuggestion } from '../types/supabase';

const suggestionStore = (() => {
	const { subscribe, set, update } = writable<CashFlowSuggestion[]>([]);

	async function load(supabase: SupabaseClient) {
		set(await getSuggestions(supabase));
	}

	function remove(id: string) {
		update((suggestions) => suggestions.filter((s) => s.id !== id));
	}

	return { subscribe, load, remove };
})();

const suggestionCount = derived(suggestionStore, (suggestions) => suggestions.length);

export { suggestionStore, suggestionCount };
