<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { IconLoader } from '@tabler/icons-svelte';
	import { ArrowRightLeft, House, PieChart, Plus, Users } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import CashFlowModalAdd from '../components/CashFlow/CashFlowModalAdd.svelte';
	import Input from '../components/Input.svelte';
	import InputWithLabel from '../components/InputWithLabel.svelte';
	import { getFriendships } from '../network/friendship';
	import { friendsStore } from '../stores/friends';
	import { getProfilesFromFriendships } from '../utils/friends';
	import type { PageData } from './$types';

	export let data: PageData;

	let iconSize = 28;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let email: string;
	let password: string;
	let loading: boolean = false;
	let toastState: 'error' | 'idle' = 'idle';

	let cashFlowModalOpen: boolean = false;

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		setupFriendsStore();

		return () => subscription.unsubscribe();
	});

	async function setupFriendsStore() {
		const userId = session?.user.id;
		if (!userId) {
			friendsStore.set([]);
			return;
		}
		const friendships = await getFriendships(supabase);
		const profiles = getProfilesFromFriendships(friendships, userId);
		friendsStore.set(profiles);
	}

	const handleSignIn = async () => {
		loading = true;
		try {
			const res = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (res.error) {
				toastState = 'error';
				setTimeout(() => {
					toastState = 'idle';
				}, 3000);
			}
		} catch (e) {
			console.error(e);
		}
		loading = false;
	};

	const tabElementClass = 'px-4 py-4 text-muted-foreground';
</script>

<div class="flex items-center justify-center overflow-hidden font-poppins">
	<div
		class="relative flex h-[calc(100dvh)] w-[600px] max-w-full flex-col overflow-x-hidden pb-[100px] pt-8"
	>
		{#if session}
			{#if cashFlowModalOpen}
				<CashFlowModalAdd bind:open={cashFlowModalOpen} />
			{/if}
			<div>
				<slot />
			</div>
			<div class="fixed bottom-0 left-0 right-0 flex justify-center">
				<div
					class="flex w-[600px] max-w-full items-center justify-between border-t border-border bg-background px-2 pb-5 pt-3"
				>
					<a href="/" class="{tabElementClass} {$page.url.pathname === '/' ? '!text-primary' : ''}">
						<House size={iconSize} />
					</a>
					<a
						href="/debt"
						class="{tabElementClass} {$page.url.pathname === '/debt' ? '!text-primary' : ''}"
					>
						<Users size={iconSize} />
					</a>
					<Button
						on:click={() => (cashFlowModalOpen = true)}
						variant="ghost"
						size="icon"
						class="text-foreground"
					>
						<Plus size={38} />
					</Button>
					<a
						class="{tabElementClass} {$page.url.pathname.startsWith('/budgets')
							? '!text-primary'
							: ''}"
						href="/budgets"
					>
						<ArrowRightLeft size={iconSize} />
					</a>
					<a
						href="/insights"
						class="{tabElementClass} {$page.url.pathname === '/insights' ? '!text-primary' : ''}"
					>
						<PieChart size={iconSize} />
					</a>
				</div>
			</div>
		{:else}
			<div class="grid h-screen place-items-center">
				{#if toastState === 'error'}
					<div class="toast toast-center toast-top">
						<div class="alert alert-error">
							<span class="text-white">Anmeldung fehlgeschlagen: Falsches Passwort.</span>
						</div>
					</div>
				{/if}
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
