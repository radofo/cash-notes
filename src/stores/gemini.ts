import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';

function createGeminiApiKeyStore() {
	const initialValue = browser ? localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || '' : '';

	const { subscribe, set } = writable<string>(initialValue);

	return {
		subscribe,
		set: (value: string) => {
			if (browser) {
				if (value) {
					localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, value);
				} else {
					localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
				}
			}
			set(value);
		}
	};
}

export const geminiApiKey = createGeminiApiKeyStore();
