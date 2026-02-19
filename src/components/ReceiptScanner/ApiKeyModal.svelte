<script lang="ts">
	import { X, Key } from 'lucide-svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import Modal from '../Modal.svelte';
	import Button from '../Button.svelte';
	import { geminiApiKey } from '../../stores/gemini';

	export let showModal = false;

	const dispatch = createEventDispatcher<{
		saved: void;
	}>();

	let tempApiKey = '';

	onMount(() => {
		tempApiKey = $geminiApiKey;
	});

	$: if (showModal) {
		tempApiKey = $geminiApiKey;
	}

	function saveApiKey() {
		geminiApiKey.set(tempApiKey);
		showModal = false;
		if (tempApiKey) {
			dispatch('saved');
		}
	}
</script>

<Modal bind:showModal>
	<div slot="header" class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Gemini API Schlüssel</h2>
		<button on:click={() => (showModal = false)} class="p-1">
			<X size={20} />
		</button>
	</div>
	<div class="flex flex-col gap-4">
		<p class="text-sm text-muted-foreground">
			Um Kassenbons zu scannen, benötigst du einen Gemini API Schlüssel. Du kannst diesen kostenlos
			bei Google AI Studio erstellen.
		</p>
		<div class="flex flex-col gap-2">
			<label for="apiKey" class="text-sm font-medium">API Schlüssel</label>
			<div class="flex items-center gap-2">
				<Key size={16} class="text-muted-foreground" />
				<input
					id="apiKey"
					type="password"
					bind:value={tempApiKey}
					placeholder="Dein Gemini API Schlüssel"
					class="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
				/>
			</div>
		</div>
		<a
			href="https://aistudio.google.com/app/apikey"
			target="_blank"
			rel="noopener noreferrer"
			class="text-sm text-primary underline"
		>
			API Schlüssel bei Google AI Studio erstellen →
		</a>
		<div class="flex justify-end gap-2">
			<Button variant="dashed" on:btnclick={() => (showModal = false)}>Abbrechen</Button>
			<Button on:btnclick={saveApiKey}>Speichern</Button>
		</div>
	</div>
</Modal>
