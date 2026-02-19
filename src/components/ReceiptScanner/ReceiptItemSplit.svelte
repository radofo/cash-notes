<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { ReceiptItemWithSplit } from '../../types/receipt';
	import { displayCurrency } from '../../utils/currency';
	import SplitSlider from './SplitSlider.svelte';

	export let items: ReceiptItemWithSplit[];
	export let currentIndex: number = 0;
	export let total: number;
	export let friendName: string;
	export let storeName: string;
	export let date: string;

	const dispatch = createEventDispatcher<{
		update: { index: number; item: ReceiptItemWithSplit };
		done: ReceiptItemWithSplit[];
		close: void;
		showSummary: void;
	}>();

	// Calculate totals
	$: friendTotal = items.reduce((sum, item) => sum + item.friendAmount, 0);
	$: ownTotal = items.reduce((sum, item) => sum + item.ownAmount, 0);
	$: currentItem = items[currentIndex];
	$: isLastItem = currentIndex === items.length - 1;
	$: isFirstItem = currentIndex === 0;

	// Format date as dd.mm.yyyy
	$: formattedDate = (() => {
		const d = new Date(date);
		const day = d.getDate().toString().padStart(2, '0');
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const year = d.getFullYear();
		return `${day}.${month}.${year}`;
	})();

	// Touch handling for swipe
	let touchStartX = 0;
	let touchEndX = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchMove(e: TouchEvent) {
		touchEndX = e.touches[0].clientX;
	}

	function handleTouchEnd() {
		const diff = touchStartX - touchEndX;
		const threshold = 50;

		if (diff > threshold && !isLastItem) {
			goNext();
		} else if (diff < -threshold && !isFirstItem) {
			goPrevious();
		}
	}

	function goNext() {
		if (isLastItem) {
			dispatch('done', items);
		} else {
			currentIndex++;
		}
	}

	function goPrevious() {
		if (!isFirstItem) {
			currentIndex--;
		}
	}

	function handleSliderChange(event: CustomEvent<number>) {
		const percentage = event.detail;
		const friendAmount = (currentItem.totalPrice * percentage) / 100;
		const ownAmount = currentItem.totalPrice - friendAmount;

		const updatedItem: ReceiptItemWithSplit = {
			...currentItem,
			friendPercentage: percentage,
			friendAmount: Math.round(friendAmount * 100) / 100,
			ownAmount: Math.round(ownAmount * 100) / 100
		};

		items[currentIndex] = updatedItem;
		items = items; // Trigger reactivity
		dispatch('update', { index: currentIndex, item: updatedItem });
	}
</script>

<div class="fixed inset-0 z-50 flex flex-col bg-background">
	<!-- Top Section: Summary (clickable to go to final overview) -->
	<button
		on:click={() => dispatch('showSummary')}
		class="flex w-full items-start justify-between border-b px-4 py-4 text-left transition-colors hover:bg-muted/50"
		aria-label="Zur Übersicht"
	>
		<!-- Left: Store name and date -->
		<div class="flex flex-col gap-1">
			<span class="text-2xl font-bold">{storeName}</span>
			<span class="text-sm text-muted-foreground">{formattedDate}</span>
		</div>
		<!-- Right: Amounts with labels -->
		<div class="flex flex-col items-end gap-1">
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">Gesamt</span>
				<span class="font-medium">{displayCurrency({ amount: total })}</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">{friendName}</span>
				<span class="font-medium">{displayCurrency({ amount: friendTotal })}</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">Ich</span>
				<span class="font-medium">{displayCurrency({ amount: ownTotal })}</span>
			</div>
		</div>
	</button>

	<!-- Middle Section: Current Item with swipe -->
	<div
		class="flex flex-1"
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}
	>
		<!-- Left side: Item info (left-aligned) -->
		<div class="flex flex-1 flex-col justify-center gap-1 px-4">
			<span class="text-2xl font-bold">{currentItem.name}</span>
			<div class="mt-2 grid w-fit grid-cols-[auto_auto] gap-x-2 gap-y-1 font-bold">
				<span class="text-xl font-bold">{displayCurrency({ amount: currentItem.totalPrice })}</span>
				<span class="text-xl text-muted-foreground">Gesamt</span>
				<span class="text-xl font-bold"
					>{displayCurrency({ amount: currentItem.friendAmount })}</span
				>
				<span class="text-xl text-muted-foreground">{friendName}</span>
				<span class="text-xl font-bold">{displayCurrency({ amount: currentItem.ownAmount })}</span>
				<span class="text-xl text-muted-foreground">Du</span>
			</div>
		</div>

		<!-- Right side: Clickable area to move forward -->
		<button
			on:click={goNext}
			class="flex w-24 items-center justify-center transition-colors hover:bg-muted/30"
			aria-label={isLastItem ? 'Fertig' : 'Nächster Artikel'}
		>
			<ChevronRight size={28} />
		</button>
	</div>

	<!-- Bottom Section: Split Controls -->
	<div class="p-4">
		<SplitSlider
			percentage={currentItem.friendPercentage}
			{friendName}
			on:change={handleSliderChange}
		/>
	</div>
</div>
