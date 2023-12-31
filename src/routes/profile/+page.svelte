<script lang="ts">
	import Button from '../../components/Button.svelte';
	import DefaultPageContent from '../../components/DefaultPageContent.svelte';
	import H1 from '../../components/H1.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};
</script>

{#if user}
	<DefaultPageContent>
		<div class="flex w-full flex-col items-center gap-6 px-4">
			<H1>Profil</H1>
			<Button variant="error" on:btnclick={handleSignOut}>Ausloggen</Button>
		</div>
	</DefaultPageContent>
{/if}
