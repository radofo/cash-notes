<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import '../app.css';
	import {
		IconCalendar,
		IconHome2,
		IconLoader,
		IconMoneybag,
		IconRefresh,
		IconUser
	} from '@tabler/icons-svelte';
	import InputWithLabel from '../components/InputWithLabel.svelte';
	import Input from '../components/Input.svelte';
	import Button from '../components/Button.svelte';
	import { page } from '$app/stores';

	export let data: PageData;

	let iconSize = 30;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let email: string;
	let password: string;
	let loading: boolean = false;

	$: {
		let x = $page.url.pathname;
	}

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
</script>

<div class="flex items-center justify-center overflow-hidden font-poppins">
	<div class="relative flex h-[calc(100dvh)] w-[600px] max-w-full flex-col overflow-hidden">
		{#if session}
			<div class="flex-1 overflow-y-scroll pt-8">
				<slot />
			</div>
			<div class="flex justify-between border-t px-8 pb-5">
				<a href="/" class="px-8 py-4 {$page.url.pathname === '/' ? 'text-green-700' : ''}">
					<IconHome2 size={iconSize} />
				</a>
				<a
					class="px-8 py-4 {$page.url.pathname === '/budgets' ? 'text-green-700' : ''}"
					href="/budgets"
				>
					<IconCalendar size={iconSize} />
				</a>
				<a
					href="/profile"
					class="px-8 py-4 {$page.url.pathname === '/profile' ? 'text-green-700' : ''}"
				>
					<IconUser size={iconSize} /></a
				>
			</div>
		{:else}
			<div class="grid h-screen place-items-center">
				<form on:submit={handleSignIn} class="flex w-full flex-col gap-5 px-2 sm:w-[500px]">
					<div class="flex flex-col gap-3">
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
</div>
