<script lang="ts">
	import Button from '../../components/Button.svelte';
	import DefaultPageContent from '../../components/DefaultPageContent.svelte';
	import H1 from '../../components/H1.svelte';
	import Input from '../../components/Input.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let newPassword: string = '';
	let newPasswordRequested: boolean = false;
	let toastState: 'success' | 'error' | 'idle' = 'idle';

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};

	async function updatePassword() {
		if (!newPassword) return;
		if (newPasswordRequested) {
			const res = await supabase.auth.updateUser({ password: newPassword });
			if (!res.error) {
				toastState = 'success';
				setTimeout(() => {
					toastState = 'idle';
				}, 3000);
			} else {
				toastState = 'error';
				setTimeout(() => {
					toastState = 'idle';
				}, 3000);
			}
			newPassword = '';
			newPasswordRequested = false;
		} else {
			newPasswordRequested = true;
		}
	}
</script>

{#if user}
	<DefaultPageContent>
		<div class="flex w-full flex-col items-center gap-6 px-4">
			<H1>Profil</H1>
			<div class="flex w-full flex-col gap-10">
				<Button variant="error" on:btnclick={handleSignOut}>Ausloggen</Button>
				<form class="flex max-w-full flex-1 flex-row items-end gap-2" on:submit={updatePassword}>
					<div class="flex flex-1 flex-col gap-1">
						<span class="text-sm text-muted-foreground">Neues Passwort</span>
						<Input inputType="password" bind:inputValue={newPassword} />
					</div>
					<Button type="submit">
						{#if newPasswordRequested}
							<span>Neues PW Bestätigen</span>
						{:else}
							<span>Ändern</span>
						{/if}
					</Button>
				</form>
			</div>
		</div>
		{#if toastState === 'error'}
			<div class="toast toast-center toast-top">
				<div class="alert alert-error">
					<span class="text-white">Passwort konnte nicht geändert werden</span>
				</div>
			</div>
		{/if}
		{#if toastState === 'success'}
			<div class="toast toast-center toast-top">
				<div class="alert alert-success">
					<span class="text-white">Passwort erfolgreich geändert</span>
				</div>
			</div>
		{/if}
	</DefaultPageContent>
{/if}
