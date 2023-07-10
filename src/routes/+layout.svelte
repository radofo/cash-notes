<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let email: string;
	let password: string;

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});

	const handleSignIn = async () => {
		await supabase.auth.signInWithPassword({
			email,
			password
		});
	};

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};
</script>

{#if session}
	<button on:click={handleSignOut}>Sign out</button>
	<a href="/cash-group">Cash Groups</a>
	<a href="/">Home</a>
	<slot />
{:else}
	<p>Please Login</p>
	<input name="email" bind:value={email} />
	<input type="password" name="password" bind:value={password} />

	<button on:click={handleSignIn}>Sign in</button>
{/if}
