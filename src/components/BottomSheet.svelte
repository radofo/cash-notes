<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/ui/button/button.svelte';
	import { X } from 'lucide-svelte';

	export let open: boolean;
	export let title: string = '';
	export let showCloseButton: boolean = true;

	const dispatch = createEventDispatcher();

	// Drag state
	let isDragging = false;
	let dragStartY = 0;
	let currentDragY = 0;
	let isClosing = false;
	let isVisible = false;

	// Threshold to dismiss (in pixels)
	const DISMISS_THRESHOLD = 150;

	// Reactive style for the sheet
	$: sheetTransform = `translateY(${currentDragY}px)`;
	$: sheetTransition = isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';

	// Handle open state changes
	$: if (open && !isVisible && !isClosing) {
		// Opening: start with sheet off-screen, then animate in
		currentDragY = window?.innerHeight || 1000;
		isVisible = true;
		// Use requestAnimationFrame to ensure the initial position is rendered first
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				currentDragY = 0;
			});
		});
	}

	function close() {
		if (isClosing) return;
		isClosing = true;
		// Animate out
		currentDragY = window?.innerHeight || 1000;
		setTimeout(() => {
			open = false;
			isVisible = false;
			isClosing = false;
			currentDragY = 0;
			dispatch('close');
		}, 300);
	}

	function handleBackdropClick() {
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			close();
		}
	}

	function handleSubmit() {
		dispatch('submit');
	}

	// Touch events for mobile
	function handleTouchStart(event: TouchEvent) {
		if (isClosing) return;
		isDragging = true;
		dragStartY = event.touches[0].clientY;
	}

	function handleTouchMove(event: TouchEvent) {
		if (!isDragging) return;
		const touchY = event.touches[0].clientY;
		const deltaY = touchY - dragStartY;
		// Only allow dragging downward
		currentDragY = Math.max(0, deltaY);
	}

	function handleTouchEnd() {
		if (!isDragging) return;
		isDragging = false;

		if (currentDragY > DISMISS_THRESHOLD) {
			// Dismiss the sheet
			close();
		} else {
			// Snap back to original position
			currentDragY = 0;
		}
	}

	// Mouse events for desktop
	function handleMouseDown(event: MouseEvent) {
		if (isClosing) return;
		isDragging = true;
		dragStartY = event.clientY;
		// Prevent text selection while dragging
		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;
		const deltaY = event.clientY - dragStartY;
		// Only allow dragging downward
		currentDragY = Math.max(0, deltaY);
	}

	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;

		if (currentDragY > DISMISS_THRESHOLD) {
			// Dismiss the sheet
			close();
		} else {
			// Snap back to original position
			currentDragY = 0;
		}
	}
</script>

<svelte:window
	on:keydown={handleKeydown}
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
/>

{#if isVisible}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		on:click={handleBackdropClick}
		on:keydown={(e) => e.key === 'Enter' && handleBackdropClick()}
		role="button"
		tabindex="0"
		aria-label="Close bottom sheet"
	/>

	<!-- Bottom Sheet -->
	<div
		class="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl bg-background shadow-xl"
		style="transform: {sheetTransform}; transition: {sheetTransition};"
		role="dialog"
		aria-modal="true"
		aria-labelledby="bottom-sheet-title"
	>
		<!-- Handle bar (draggable) -->
		<div
			class="flex cursor-grab touch-none select-none justify-center pb-2 pt-3 active:cursor-grabbing"
			on:touchstart={handleTouchStart}
			on:mousedown={handleMouseDown}
			role="slider"
			aria-label="Drag to dismiss"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.min(100, Math.round((currentDragY / DISMISS_THRESHOLD) * 100))}
			tabindex="0"
		>
			<div class="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
		</div>

		<!-- Header -->
		<div class="flex items-center justify-between px-4 pb-4">
			<h2 id="bottom-sheet-title" class="text-lg font-bold">
				{#if title}
					{title}
				{:else}
					<slot name="header" />
				{/if}
			</h2>
			{#if showCloseButton}
				<Button class="p-1" variant="ghost" on:click={close}>
					<X />
				</Button>
			{/if}
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto px-4 pb-8">
			<form class="flex h-full flex-col" on:submit|preventDefault={handleSubmit}>
				<slot name="content" />
				<slot />
			</form>
		</div>
	</div>
{/if}
