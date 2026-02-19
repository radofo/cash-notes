<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let percentage: number = 0; // 0-100, represents friend's share
	export let friendName: string = 'Freund';

	const dispatch = createEventDispatcher<{
		change: number;
	}>();

	const presets = [0, 50, 100];

	function handleSliderChange(event: Event) {
		const target = event.target as HTMLInputElement;
		percentage = Number.parseInt(target.value, 10);
		dispatch('change', percentage);
	}

	function selectPreset(value: number) {
		percentage = value;
		dispatch('change', percentage);
	}
</script>

<div class="flex flex-col gap-4">
	<!-- Slider -->
	<div class="flex flex-col gap-2">
		<input
			type="range"
			min="0"
			max="100"
			step="1"
			value={percentage}
			on:input={handleSliderChange}
			class="slider h-4 w-full cursor-pointer appearance-none rounded-md bg-muted accent-primary"
			aria-label="Anteil für Freund"
		/>
		<div class="flex justify-between text-xs">
			<span>Ich</span>
			<span>{friendName}</span>
		</div>
	</div>

	<!-- Preset buttons -->
	<div class="flex gap-2">
		{#each presets as preset}
			<button
				on:click={() => selectPreset(preset)}
				class="flex-1 rounded-lg border p-2 text-sm font-medium transition-colors {percentage ===
				preset
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-input bg-background hover:bg-surface-hover'}"
				aria-label="{preset}% für {friendName}"
			>
				{preset}%
			</button>
		{/each}
	</div>
</div>

<style>
	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: hsl(var(--primary));
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: hsl(var(--primary));
		cursor: pointer;
		border: none;
	}
</style>
