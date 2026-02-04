import { writable } from 'svelte/store';

/**
 * Store to trigger debt list reloads across the app
 * When a debt is created/updated/deleted, increment this counter
 * Components can subscribe to this to know when to reload debt data
 */
const debtReloadTrigger = (() => {
	const { subscribe, update } = writable(0);

	function triggerReload() {
		update((n) => n + 1);
	}

	return {
		subscribe,
		triggerReload
	};
})();

export { debtReloadTrigger };
