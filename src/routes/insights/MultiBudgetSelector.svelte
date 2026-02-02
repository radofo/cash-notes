<script lang="ts">
	import { Check, ChevronDown } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let budgets: string[] = [];
	export let selectedBudgets: string[] = [];

	const dispatch = createEventDispatcher<{
		change: { selectedBudgets: string[] };
	}>();

	let showDropdown = false;
	let triggerButton: HTMLButtonElement;
	let dropdownPosition = { left: 0, bottom: 0 };

	$: allSelected = selectedBudgets.length === budgets.length && budgets.length > 0;
	$: noneSelected = selectedBudgets.length === 0;
	$: displayText = allSelected
		? 'Alle Budgets'
		: noneSelected
		? 'Keine ausgewählt'
		: selectedBudgets.length === 1
		? selectedBudgets[0]
		: `${selectedBudgets.length} Budgets`;

	function toggleBudget(budget: string) {
		if (selectedBudgets.includes(budget)) {
			selectedBudgets = selectedBudgets.filter((b) => b !== budget);
		} else {
			selectedBudgets = [...selectedBudgets, budget];
		}
		dispatchChange();
	}

	function selectAll() {
		selectedBudgets = [...budgets];
		dispatchChange();
	}

	function clearAll() {
		selectedBudgets = [];
		dispatchChange();
	}

	function dispatchChange() {
		dispatch('change', { selectedBudgets });
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.budget-selector-container')) {
			showDropdown = false;
		}
	}

	function updateDropdownPosition() {
		const rect = triggerButton.getBoundingClientRect();
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

<svelte:window on:click={handleClickOutside} />

<div class="budget-selector-container relative">
	<button
		bind:this={triggerButton}
		type="button"
		class="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
		on:click|stopPropagation={() => {
			if (!showDropdown) {
				updateDropdownPosition();
			}
			showDropdown = !showDropdown;
		}}
	>
		<span class="max-w-[120px] truncate">{displayText}</span>
		<ChevronDown size={16} class="text-text-tertiary" />
	</button>

	{#if showDropdown}
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
		<div
			class="fixed z-[100] w-64 rounded-xl border border-border bg-background shadow-lg"
			style="left: {dropdownPosition.left}px; bottom: {dropdownPosition.bottom}px;"
			on:click|stopPropagation
		>
			<!-- Header with Select All / Clear -->
			<div class="flex items-center justify-between border-b border-border px-3 py-2">
				<span class="text-xs font-medium text-text-secondary">Budgets wählen</span>
				<div class="flex gap-2">
					<button type="button" class="text-xs text-primary hover:underline" on:click={selectAll}>
						Alle
					</button>
					<button
						type="button"
						class="text-xs text-text-tertiary hover:underline"
						on:click={clearAll}
					>
						Keine
					</button>
				</div>
			</div>

			<!-- Budget list -->
			<div class="max-h-48 overflow-y-auto p-2">
				{#each budgets as budget}
					{@const isSelected = selectedBudgets.includes(budget)}
					<button
						type="button"
						class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-hover"
						on:click={() => toggleBudget(budget)}
					>
						<div
							class="flex h-4 w-4 items-center justify-center rounded border transition-colors
								{isSelected ? 'border-primary bg-primary' : 'border-border'}"
						>
							{#if isSelected}
								<Check size={12} class="text-white" />
							{/if}
						</div>
						<span class="truncate">{budget}</span>
					</button>
				{/each}
			</div>

			<!-- Footer showing selection count -->
			<div class="border-t border-border px-3 py-2 text-center">
				<span class="text-xs text-text-tertiary">
					{selectedBudgets.length} von {budgets.length} ausgewählt
				</span>
			</div>
		</div>
	{/if}
</div>
