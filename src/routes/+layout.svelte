<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import '../app.css';
	import {
		IconCash,
		IconHome,
		IconHome2,
		IconLoader,
		IconLogout,
		IconMoneybag
	} from '@tabler/icons-svelte';
	import InputWithLabel from '../components/InputWithLabel.svelte';
	import Input from '../components/Input.svelte';
	import Button from '../components/Button.svelte';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let email: string;
	let password: string;
	let loading: boolean = false;

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
		loading = true;
		await supabase.auth.signInWithPassword({
			email,
			password
		});
		loading = false;
	};

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};
</script>

<div class="overflow-hidden font-poppins">
	{#if session}
		<div class="mb-10 flex flex-row justify-between p-4">
			<div class="flex gap-6">
				<a class=" text-slate-800 hover:text-green-800" href="/"> Home </a>
				<a class="text-slate-800 hover:text-green-800" href="/budgets"> Budgets </a>
			</div>
			<div class="flex gap-2">
				<!-- <h2 class="mx-5 font-normal underline">{session?.user?.email}</h2> -->
				<button on:click={handleSignOut}> <IconLogout /></button>
			</div>
		</div>
		<slot />
	{:else}
		<div class="grid h-screen place-items-center">
			<form on:submit={handleSignIn} class="flex w-full flex-col gap-5 px-2 sm:w-[500px]">
				<div class="flex flex-col gap-3 border">
					<InputWithLabel label="E-Mail">
						<Input inputType="text" bind:inputValue={email} />
					</InputWithLabel>
					<InputWithLabel label="Password">
						<Input inputType="password" bind:inputValue={password} />
					</InputWithLabel>
				</div>
				<Button type="submit">
					{#if loading}
						<div class="grid place-items-center">
							<IconLoader class="animate-spin text-center" />
						</div>
					{:else}
						Login
					{/if}
				</Button>
			</form>
		</div>
	{/if}
</div>
