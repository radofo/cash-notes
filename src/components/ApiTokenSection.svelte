<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { Check, Copy } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import dayjs from 'dayjs';
	import Button from './Button.svelte';
	import { createApiToken, getApiTokenCreatedAt, revokeApiToken } from '../network/api_token';

	export let supabase: SupabaseClient;

	let createdAt: string | null = null;
	let loaded = false;
	let busy = false;
	let error = '';
	// Plaintext is only known right after creation and is never shown again
	let newToken: string | null = null;
	let confirmRegenerate = false;
	let confirmRevoke = false;
	let copied = false;

	onMount(async () => {
		createdAt = await getApiTokenCreatedAt(supabase);
		loaded = true;
	});

	async function handleCreate() {
		if (createdAt && !confirmRegenerate) {
			confirmRegenerate = true;
			return;
		}
		busy = true;
		error = '';
		const token = await createApiToken(supabase);
		if (token) {
			newToken = token;
			createdAt = new Date().toISOString();
		} else {
			error = 'Token konnte nicht erstellt werden';
		}
		confirmRegenerate = false;
		busy = false;
	}

	async function handleRevoke() {
		if (!confirmRevoke) {
			confirmRevoke = true;
			return;
		}
		busy = true;
		error = '';
		if (await revokeApiToken(supabase)) {
			createdAt = null;
			newToken = null;
		} else {
			error = 'Token konnte nicht widerrufen werden';
		}
		confirmRevoke = false;
		busy = false;
	}

	async function copy(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// Fallback for browsers without clipboard API access
			const textarea = document.createElement('textarea');
			textarea.value = text;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			textarea.remove();
		}
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<section class="flex w-full flex-col gap-3">
	<span class="font-poppins font-medium">Apple Pay Automatisierung</span>

	{#if loaded}
		<span class="text-sm text-muted-foreground">
			{#if createdAt}
				Token aktiv seit {dayjs(createdAt).format('DD.MM.YYYY')}
			{:else}
				Kein Token vorhanden
			{/if}
		</span>
	{/if}

	{#if newToken}
		<div class="flex flex-col gap-2 rounded-lg bg-surface p-3">
			<span class="text-sm font-medium">Dein neuer Token</span>
			<code class="select-all break-all rounded-md bg-muted p-2 font-mono text-sm">{newToken}</code>
			<Button fullWidth on:btnclick={() => newToken && copy(newToken)}>
				{#if copied}
					<Check size={18} /> Kopiert
				{:else}
					<Copy size={18} /> Token kopieren
				{/if}
			</Button>
		</div>
	{/if}

	<div class="flex flex-row gap-2">
		<Button fullWidth disabled={busy || !loaded} on:btnclick={handleCreate}>
			{#if confirmRegenerate}
				Alten Token ersetzen?
			{:else if createdAt}
				Neuen Token erstellen
			{:else}
				Token erstellen
			{/if}
		</Button>
		{#if createdAt}
			<Button variant="error" disabled={busy} on:btnclick={handleRevoke}>
				{confirmRevoke ? 'Wirklich widerrufen?' : 'Widerrufen'}
			</Button>
		{/if}
	</div>

	{#if error}
		<span class="text-sm text-red-600">{error}</span>
	{/if}
</section>
