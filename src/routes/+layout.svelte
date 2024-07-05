<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { IconLoader } from '@tabler/icons-svelte';
	import {
		ArrowRightLeft,
		House,
		PieChart,
		Plus,
		RefreshCcw,
		Settings,
		WalletCards
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import Input from '../components/Input.svelte';
	import InputWithLabel from '../components/InputWithLabel.svelte';
	import BudgetModalAdd from '../components/Monthly/Budget/BudgetModalAdd.svelte';
	import RecurringModalAdd from '../components/Monthly/Recurring/RecurringModalAdd.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let iconSize = 28;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let email: string;
	let password: string;
	let loading: boolean = false;

	let recurringModalOpen: boolean = false;
	let budgetModalOpen: boolean = false;
	let isAddMenuOpen: boolean = false;

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
	const tabAddClass = 'px-4 py-2';
</script>

<div class="flex items-center justify-center overflow-hidden font-poppins">
	<div class="relative flex h-[calc(100dvh)] w-[600px] max-w-full flex-col overflow-hidden">
		{#if session}
			<div class="flex-1 overflow-y-scroll pt-8">
				<slot />
				<RecurringModalAdd bind:open={recurringModalOpen} />
				<BudgetModalAdd bind:open={budgetModalOpen} />
			</div>
			<div class="flex justify-between px-2 pb-5">
				<a href="/" class="{tabElementClass} {$page.url.pathname === '/' ? 'text-green-700' : ''}">
					<House size={iconSize} />
				</a>
				<a
					class="{tabElementClass} {$page.url.pathname === '/budgets' ? 'text-green-700' : ''}"
					href="/budgets"
				>
					<ArrowRightLeft size={iconSize} />
				</a>
				<DropdownMenu.Root bind:open={isAddMenuOpen}>
					<DropdownMenu.Trigger class={tabAddClass}>
						<Button variant="ghost" size="icon">
							<Plus class="h-12 w-12" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item on:click={() => (budgetModalOpen = true)}>
							<div class="flex flex-row items-center gap-4">
								<WalletCards size={30} />
								<div class="flex flex-col">
									<span class="text-base font-semibold">Budget</span>
									<span class="text-muted-foreground">Erstelle ein neues Budget</span>
								</div>
							</div>
						</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => (recurringModalOpen = true)}>
							<div class="flex flex-row items-center gap-4">
								<RefreshCcw size={28} />
								<div class="flex flex-col">
									<span class="text-base font-semibold">Mtl. Zahlung</span>
									<span class="text-muted-foreground">Erstelle ein neue monatliche Zahlung</span>
								</div>
							</div>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<a
					href="/"
					class="{tabElementClass} {$page.url.pathname === '/analysis' ? 'text-green-700' : ''}"
				>
					<PieChart size={iconSize} />
				</a>
				<a
					href="/profile"
					class="{tabElementClass} {$page.url.pathname === '/profile' ? 'text-green-700' : ''}"
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
