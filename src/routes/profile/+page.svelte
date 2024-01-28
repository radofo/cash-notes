<script lang="ts">
	import Button from '../../components/Button.svelte';
	import DefaultPageContent from '../../components/DefaultPageContent.svelte';
	import H1 from '../../components/H1.svelte';
	import Input from '../../components/Input.svelte';
	import InputWithLabel from '../../components/InputWithLabel.svelte';
	import { obfuscate } from '../../stores/preferences';
	import type { PageData } from './$types';

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

  let newPassword: string = '';

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};

  async function updatePassword() {
    await supabase.auth.updateUser({ password: newPassword})
    newPassword = '';
  }
</script>

{#if user}
	<DefaultPageContent>
		<div class="flex w-full flex-col items-center gap-6 px-4">
			<H1>Profil</H1>
      <div class="flex flex-col gap-6">
			<Button variant="error" on:btnclick={handleSignOut}>Ausloggen</Button>
			<div class="flex flex-row items-center gap-3">
				<span>Sensible Daten verdecken</span>
				<input type="checkbox" class="toggle-success toggle" bind:checked={$obfuscate} />
			</div>
      <form class="flex flex-row items-end gap-2 flex-1 max-w-full" on:submit={updatePassword}>
        <InputWithLabel label="Neues Passwort">
          <Input inputType="password" bind:inputValue={newPassword} />
        </InputWithLabel>
        <Button type="submit">
          Ändern
        </Button>
      </form>
      </div>
		</div>
	</DefaultPageContent>
{/if}
