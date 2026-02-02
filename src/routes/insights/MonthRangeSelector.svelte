<script lang="ts">
	import { ChevronDown, X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { months } from '../../utils/date';

	export let fromMonth: number;
	export let fromYear: number;
	export let toMonth: number | null;
	export let toYear: number | null;
	export let availableMonths: string[] = [];

	const dispatch = createEventDispatcher<{
		change: { fromMonth: number; fromYear: number; toMonth: number | null; toYear: number | null };
	}>();

	let showFromPicker = false;
	let showToPicker = false;

	// Button references for positioning
	let fromButton: HTMLButtonElement;
	let toButton: HTMLButtonElement;
	let dropdownPosition = { left: 0, bottom: 0 };

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	// Get available years from availableMonths
	$: availableYears = [...new Set(availableMonths.map((m) => parseInt(m.split('-')[0])))].sort(
		(a, b) => b - a
	);

	$: minYear = availableYears.length > 0 ? Math.min(...availableYears) : currentYear - 5;
	$: maxYear = currentYear;

	// Short month names for display
	const shortMonths = months.map((m) => m.substring(0, 3));

	function formatMonthYear(month: number | null, year: number | null): string {
		if (month === null || year === null) return '-';
		return `${shortMonths[month]} ${year}`;
	}

	function isMonthDisabled(month: number, year: number, isFromPicker: boolean): boolean {
		const checkDate = new Date(year, month);
		const currentMaxDate = new Date(currentYear, currentMonth);

		// Can't be in the future
		if (checkDate > currentMaxDate) return true;

		if (isFromPicker) {
			// From can't be after To (if To is set)
			if (toMonth !== null && toYear !== null) {
				const toDate = new Date(toYear, toMonth);
				if (checkDate > toDate) return true;
			}
		} else {
			// To can't be before From
			const fromDate = new Date(fromYear, fromMonth);
			if (checkDate < fromDate) return true;
			// To can't be in the future
			if (checkDate > currentMaxDate) return true;
		}

		return false;
	}

	function selectFromMonth(month: number, year: number) {
		if (isMonthDisabled(month, year, true)) return;
		fromMonth = month;
		fromYear = year;
		showFromPicker = false;
		dispatchChange();
	}

	function selectToMonth(month: number, year: number) {
		if (isMonthDisabled(month, year, false)) return;
		toMonth = month;
		toYear = year;
		showToPicker = false;
		dispatchChange();
	}

	function clearTo() {
		toMonth = null;
		toYear = null;
		dispatchChange();
	}

	function dispatchChange() {
		dispatch('change', { fromMonth, fromYear, toMonth, toYear });
	}

	function handlePickerClickOutside(event: MouseEvent, pickerType: 'from' | 'to') {
		const target = event.target as HTMLElement;
		if (!target.closest('.month-picker-container')) {
			if (pickerType === 'from') showFromPicker = false;
			else showToPicker = false;
		}
	}

	// Generate years for picker
	$: pickerYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

	let fromPickerYear = fromYear;
	let toPickerYear = toYear ?? currentYear;

	$: if (showFromPicker) fromPickerYear = fromYear;
	$: if (showToPicker) toPickerYear = toYear ?? currentYear;

	function updateDropdownPosition(button: HTMLButtonElement) {
		const rect = button.getBoundingClientRect();
		const dropdownWidth = 256; // w-64 = 16rem = 256px
		let left = rect.left + rect.width / 2 - dropdownWidth / 2;

		// Keep within viewport
		if (left < 8) left = 8;
		if (left + dropdownWidth > window.innerWidth - 8) {
			left = window.innerWidth - dropdownWidth - 8;
		}

		dropdownPosition = {
			left,
			bottom: window.innerHeight - rect.top + 8
		};
	}
</script>

<svelte:window
	on:click={(e) => {
		if (showFromPicker) handlePickerClickOutside(e, 'from');
		if (showToPicker) handlePickerClickOutside(e, 'to');
	}}
/>

<div class="flex items-center gap-2">
	<!-- From Selector -->
	<div class="month-picker-container relative">
		<button
			bind:this={fromButton}
			type="button"
			class="flex items-center gap-1 rounded-lg bg-surface px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
			on:click|stopPropagation={() => {
				showToPicker = false;
				if (!showFromPicker) {
					updateDropdownPosition(fromButton);
				}
				showFromPicker = !showFromPicker;
			}}
		>
			<span>{formatMonthYear(fromMonth, fromYear)}</span>
			<ChevronDown size={16} class="text-text-tertiary" />
		</button>

		{#if showFromPicker}
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
			<div
				class="fixed z-[100] w-64 rounded-xl border border-border bg-background p-3 shadow-lg"
				style="left: {dropdownPosition.left}px; bottom: {dropdownPosition.bottom}px;"
				on:click|stopPropagation
			>
				<div class="mb-3 flex items-center justify-between">
					<button
						type="button"
						class="rounded p-1 hover:bg-surface"
						on:click={() => (fromPickerYear = Math.max(minYear, fromPickerYear - 1))}
						disabled={fromPickerYear <= minYear}
					>
						<ChevronDown size={16} class="rotate-90" />
					</button>
					<span class="font-medium">{fromPickerYear}</span>
					<button
						type="button"
						class="rounded p-1 hover:bg-surface"
						on:click={() => (fromPickerYear = Math.min(maxYear, fromPickerYear + 1))}
						disabled={fromPickerYear >= maxYear}
					>
						<ChevronDown size={16} class="-rotate-90" />
					</button>
				</div>
				<div class="grid grid-cols-4 gap-1">
					{#each months as month, index}
						{@const disabled = isMonthDisabled(index, fromPickerYear, true)}
						<button
							type="button"
							class="rounded-lg px-2 py-1.5 text-xs transition-colors
								{disabled ? 'cursor-not-allowed text-text-tertiary opacity-40' : 'hover:bg-surface-hover'}
								{fromMonth === index && fromYear === fromPickerYear
								? 'bg-chip-active text-chip-active-foreground'
								: ''}"
							on:click={() => selectFromMonth(index, fromPickerYear)}
							{disabled}
						>
							{shortMonths[index]}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<span class="text-text-tertiary">-</span>

	<!-- To Selector -->
	<div class="month-picker-container relative">
		<button
			bind:this={toButton}
			type="button"
			class="flex items-center gap-1 rounded-lg bg-surface px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
			on:click|stopPropagation={() => {
				showFromPicker = false;
				if (!showToPicker) {
					updateDropdownPosition(toButton);
				}
				showToPicker = !showToPicker;
			}}
		>
			<span>{formatMonthYear(toMonth, toYear)}</span>
			{#if toMonth !== null}
				<button
					type="button"
					class="ml-1 rounded-full p-0.5 hover:bg-chip-active/20"
					on:click|stopPropagation={clearTo}
				>
					<X size={12} />
				</button>
			{:else}
				<ChevronDown size={16} class="text-text-tertiary" />
			{/if}
		</button>

		{#if showToPicker}
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
			<div
				class="fixed z-[100] w-64 rounded-xl border border-border bg-background p-3 shadow-lg"
				style="left: {dropdownPosition.left}px; bottom: {dropdownPosition.bottom}px;"
				on:click|stopPropagation
			>
				<div class="mb-3 flex items-center justify-between">
					<button
						type="button"
						class="rounded p-1 hover:bg-surface"
						on:click={() => (toPickerYear = Math.max(minYear, toPickerYear - 1))}
						disabled={toPickerYear <= minYear}
					>
						<ChevronDown size={16} class="rotate-90" />
					</button>
					<span class="font-medium">{toPickerYear}</span>
					<button
						type="button"
						class="rounded p-1 hover:bg-surface"
						on:click={() => (toPickerYear = Math.min(maxYear, toPickerYear + 1))}
						disabled={toPickerYear >= maxYear}
					>
						<ChevronDown size={16} class="-rotate-90" />
					</button>
				</div>
				<div class="grid grid-cols-4 gap-1">
					{#each months as month, index}
						{@const disabled = isMonthDisabled(index, toPickerYear, false)}
						<button
							type="button"
							class="rounded-lg px-2 py-1.5 text-xs transition-colors
								{disabled ? 'cursor-not-allowed text-text-tertiary opacity-40' : 'hover:bg-surface-hover'}
								{toMonth === index && toYear === toPickerYear ? 'bg-chip-active text-chip-active-foreground' : ''}"
							on:click={() => selectToMonth(index, toPickerYear)}
							{disabled}
						>
							{shortMonths[index]}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
