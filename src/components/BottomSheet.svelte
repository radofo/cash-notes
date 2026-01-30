<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
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
	let sheetElement: HTMLDivElement;

	// Threshold to dismiss (in pixels)
	const DISMISS_THRESHOLD = 150;

	function close() {
		open = false;
		dispatch('close');
	}

	function handleBackdropClick() {
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	function handleSubmit() {
		dispatch('submit');
	}

	// Touch events for mobile
	function handleTouchStart(event: TouchEvent) {
		isDragging = true;
		dragStartY = event.touches[0].clientY;
		currentDragY = 0;
		if (sheetElement) {
			sheetElement.style.transition = 'none';
		}
	}

	function handleTouchMove(event: TouchEvent) {
		if (!isDragging) return;
		const touchY = event.touches[0].clientY;
		const deltaY = touchY - dragStartY;
		// Only allow dragging downward
		currentDragY = Math.max(0, deltaY);
		if (sheetElement) {
			sheetElement.style.transform = `translateY(${currentDragY}px)`;
		}
	}

	function handleTouchEnd() {
		if (!isDragging) return;
		isDragging = false;
		
		if (sheetElement) {
			sheetElement.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
		}

		if (currentDragY > DISMISS_THRESHOLD) {
			// Dismiss the sheet
			if (sheetElement) {
				sheetElement.style.transform = 'translateY(100%)';
			}
			setTimeout(close, 300);
		} else {
			// Snap back to original position
			if (sheetElement) {
				sheetElement.style.transform = 'translateY(0)';
			}
		}
		currentDragY = 0;
	}

	// Mouse events for desktop
	function handleMouseDown(event: MouseEvent) {
		isDragging = true;
		dragStartY = event.clientY;
		currentDragY = 0;
		if (sheetElement) {
			sheetElement.style.transition = 'none';
		}
		// Prevent text selection while dragging
		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;
		const deltaY = event.clientY - dragStartY;
		// Only allow dragging downward
		currentDragY = Math.max(0, deltaY);
		if (sheetElement) {
			sheetElement.style.transform = `translateY(${currentDragY}px)`;
		}
	}

	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;

		if (sheetElement) {
			sheetElement.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
		}

		if (currentDragY > DISMISS_THRESHOLD) {
			// Dismiss the sheet
			if (sheetElement) {
				sheetElement.style.transform = 'translateY(100%)';
			}
			setTimeout(close, 300);
		} else {
			// Snap back to original position
			if (sheetElement) {
				sheetElement.style.transform = 'translateY(0)';
			}
		}
		currentDragY = 0;
	}

	// Reset transform when sheet opens
	$: if (open && sheetElement) {
		sheetElement.style.transform = 'translateY(0)';
		sheetElement.style.transition = '';
	}
</script>

<svelte:window 
	on:keydown={handleKeydown} 
	on:mousemove={isDragging ? handleMouseMove : undefined}
	on:mouseup={isDragging ? handleMouseUp : undefined}
/>

{#if open}
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
		bind:this={sheetElement}
		class="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl bg-background shadow-xl"
		transition:fly={{ y: '100%', duration: 300, easing: cubicOut }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="bottom-sheet-title"
	>
		<!-- Handle bar (draggable) -->
		<div 
			class="flex cursor-grab justify-center pt-3 pb-2 active:cursor-grabbing touch-none select-none"
			on:touchstart={handleTouchStart}
			on:touchmove={handleTouchMove}
			on:touchend={handleTouchEnd}
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
