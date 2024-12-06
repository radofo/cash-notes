<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { IconLoader } from '@tabler/icons-svelte';
	import { ArrowRightLeft, House, PieChart, Plus, Settings } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import CashFlowModalAdd from '../components/CashFlow/CashFlowModalAdd.svelte';
	import Input from '../components/Input.svelte';
	import InputWithLabel from '../components/InputWithLabel.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let iconSize = 28;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let email: string;
	let password: string;
	let loading: boolean = false;

	let cashFlowModalOpen: boolean = false;

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_, _session) => {
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

	const tabElementClass = 'px-4 py-4';
</script>

<div class="flex items-center justify-center overflow-hidden font-poppins">
	<div class="relative flex h-[calc(100dvh)] w-[600px] max-w-full flex-col overflow-hidden">
		{#if session}
			<div class="flex-1 overflow-y-scroll pt-8">
				<slot />
				{#if cashFlowModalOpen}
					<CashFlowModalAdd bind:open={cashFlowModalOpen} />
				{/if}
			</div>
			<div class="flex items-center justify-between border-t px-2 pb-5">
				<a href="/" class="{tabElementClass} {$page.url.pathname === '/' ? 'text-sky-700' : ''}">
					<House size={iconSize} />
				</a>
				<a
					class="{tabElementClass} {$page.url.pathname.startsWith('/budgets')
						? 'text-sky-700'
						: ''}"
					href="/budgets"
				>
					<ArrowRightLeft size={iconSize} />
				</a>
				<Button on:click={() => (cashFlowModalOpen = true)} variant="ghost" size="icon">
					<Plus size={38} />
				</Button>
				<a
					href="/"
					class="{tabElementClass} {$page.url.pathname === '/analysis' ? 'text-sky-700' : ''}"
				>
					<PieChart size={iconSize} />
				</a>
				<a
					href="/profile"
					class="{tabElementClass} {$page.url.pathname === '/profile' ? 'text-sky-700' : ''}"
				>
					<Settings size={iconSize} /></a
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
