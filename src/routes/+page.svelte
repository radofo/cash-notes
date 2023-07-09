<script lang="ts">
	import type { User } from '@supabase/supabase-js';
	import { getSupabaseUser, insertCashGroup, loginUser, logoutUser } from '../auth';
	import type { InsertCashGroupDTO } from '../supabaseTypes';

	let user: User | null;
	let isLoaded = false;

	let cashGroupName: string = '';
	let cashGroupIsSaving: boolean = false;
	let cashGroupIsDefinedByFixedCost: boolean = false;
	let cashGroupIsRestOfSaving: boolean = false;
	let cashGroupTags: string[] = [];
	let cashGroupBudget: number = 0;

	async function initUser() {
		user = await getSupabaseUser();
		isLoaded = true;
	}

	async function login() {
		const { data } = await loginUser('ramonadofo@hotmail.com', 'dollaCedi');
		user = data.user;
	}

	async function logout() {
		const error = await logoutUser();
		if (!error) {
			user = null;
		}
	}

	async function saveCashGroup() {
		if (user?.id) {
			const dto: InsertCashGroupDTO = {
				budget: cashGroupBudget,
				name: cashGroupName,
				isSaving: cashGroupIsSaving,
				user_id: user?.id,
				isDefinedByFixedCost: cashGroupIsDefinedByFixedCost,
				isRestOfSaving: cashGroupIsRestOfSaving,
				tags: cashGroupTags
			};
			await insertCashGroup(dto);
		}
	}

	initUser();
</script>

{#if isLoaded}
	{#if user}
		<h2 class="mx-5 font-bold underline">Hello {user.email}</h2>
		<button on:click={logout}>Logout</button>
		<div class="flex flex-col items-center gap-3">
			<input class="border" type="text" bind:value={cashGroupName} />
			<input class="border" type="number" bind:value={cashGroupBudget} />
			<input type="checkbox" bind:value={cashGroupIsSaving} />
			<button class="rounded-lg bg-slate-100 p-2 font-poppins" on:click={saveCashGroup}
				>Save Cash Group</button
			>
		</div>
	{:else}
		<h2>Please Login</h2>
		<button on:click={login}>Login</button>
	{/if}
{:else}
	<p>...loading</p>
{/if}
