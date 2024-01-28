<script lang="ts">
	import { IconEye, IconEyeOff  } from "@tabler/icons-svelte";
	import Button from "./Button.svelte";

	export let inputValue: string;
	export let inputType: 'text' | 'number' | 'date' | 'password';
	export let textAlign: 'text-right' | 'text-left' = 'text-left';
	export let hint: string = '';

  let showPassword: boolean = false;
</script>

{#if inputType === 'text'}
	<input
		class="w-full rounded-lg border p-2 pl-3 {textAlign}"
		type="text"
		placeholder={hint}
		bind:value={inputValue}
	/>
{:else if inputType === 'number'}
	<input
		bind:value={inputValue}
		step=".01"
		type="number"
		class="w-full rounded-lg border p-2 {textAlign}"
	/>
{:else if inputType === 'date'}
	<input
		type="date"
		class="w-full shrink rounded-lg border p-2 pl-3 {textAlign}"
		placeholder={hint}
		bind:value={inputValue}
	/>
{:else if inputType === 'password'}
  <div class="flex items-center gap-1 w-full shrink">
      {#if showPassword}
        <input
          type="text"
          class="rounded-lg border p-2 pl-3 flex-1 {textAlign}"
          bind:value={inputValue}
        />
        <button on:click={() => showPassword = !showPassword}>
            <IconEyeOff class="min-w-fit pl-1 text-slate-500" size={24}/>
        </button>
      {:else}
        <input
          type="password"
          class="shrink rounded-lg border flex-1 p-2 pl-3 {textAlign}"
          bind:value={inputValue}
        />
        <button class="shrink" on:click={() => showPassword = !showPassword}>
            <IconEye class="min-w-fit pl-1 text-slate-500" size={24} />
        </button>
      {/if}
  </div>
{/if}
