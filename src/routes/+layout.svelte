<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import '../app.css';

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

<div class="p-4">
	{#if session}
		<div class="mb-20 flex flex-row justify-between">
			<div class="flex gap-6">
				<a class="text-slate-800 hover:text-green-800" href="/">Transactions</a>
				<a class="text-slate-800 hover:text-green-800" href="/budgets">Budgets</a>
			</div>
			<div class="flex gap-2">
				<h2 class="mx-5 font-normal underline">{session?.user?.email}</h2>
				<button on:click={handleSignOut}>Sign out</button>
			</div>
		</div>
		<slot />
	{:else}
		<p>Please Login</p>
		<input name="email" bind:value={email} />
		<input type="password" name="password" bind:value={password} />

		<button on:click={handleSignIn}>Sign in</button>
	{/if}
</div>
