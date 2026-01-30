<script lang="ts">
	import { createEventDispatcher } from 'svelte';
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
	let sheetElement: HTMLDivElement;
	let contentElement: HTMLDivElement;
	let shouldAnimate = false;
	let isDraggingFromContent = false;

	// Threshold to dismiss (in pixels)
	const DISMISS_THRESHOLD = 150;

	// Handle open state changes
	$: if (open && !isVisible && !isClosing) {
		isVisible = true;
		shouldAnimate = true;
		currentDragY = 0;
		// Lock body scroll
		document.body.style.overflow = 'hidden';
		document.body.style.position = 'fixed';
		document.body.style.width = '100%';
		document.body.style.top = `-${window.scrollY}px`;
	}

	// Called when the enter animation finishes - switch to JS-controlled mode
	function handleAnimationEnd(event: AnimationEvent) {
		if (event.animationName === 'slideUp' && sheetElement) {
			shouldAnimate = false;
			sheetElement.style.transform = 'translateY(0)';
		}
	}

	// Handle external close (when parent sets open = false)
	$: if (!open && isVisible && !isClosing) {
		close();
	}

	function close() {
		if (isClosing) return;
		isClosing = true;
		// Animate out using JS transition
		if (sheetElement) {
			sheetElement.classList.remove('sheet-enter');
			sheetElement.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
			sheetElement.style.transform = `translateY(${window.innerHeight}px)`;
		}
		setTimeout(() => {
			// Restore body scroll
			const scrollY = document.body.style.top;
			document.body.style.overflow = '';
			document.body.style.position = '';
			document.body.style.width = '';
			document.body.style.top = '';
			window.scrollTo(0, parseInt(scrollY || '0') * -1);

			open = false;
			isVisible = false;
			isClosing = false;
			shouldAnimate = false;
			currentDragY = 0;
			dispatch('close');
		}, 300);
	}

	function handleBackdropClick() {
		close();
	}

	function handleCloseButtonClick(event: MouseEvent) {
		event.stopPropagation();
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
		// Clear CSS animation to allow JS control
		shouldAnimate = false;
		if (sheetElement) {
			sheetElement.style.transform = 'translateY(0)';
		}
	}

	function handleTouchMove(event: TouchEvent) {
		if (!isDragging) return;
		const touchY = event.touches[0].clientY;
		const deltaY = touchY - dragStartY;
		// Only allow dragging downward
		currentDragY = Math.max(0, deltaY);
		if (sheetElement) {
			sheetElement.style.transition = 'none';
			sheetElement.style.transform = `translateY(${currentDragY}px)`;
		}
	}

	function handleTouchEnd() {
		if (!isDragging) return;
		isDragging = false;
		isDraggingFromContent = false;

		if (currentDragY > DISMISS_THRESHOLD) {
			// Dismiss the sheet
			close();
		} else {
			// Snap back to original position
			if (sheetElement) {
				sheetElement.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
				sheetElement.style.transform = 'translateY(0)';
			}
			currentDragY = 0;
		}
	}

	// Mouse events for desktop
	function handleMouseDown(event: MouseEvent) {
		if (isClosing) return;
		isDragging = true;
		dragStartY = event.clientY;
		// Clear CSS animation to allow JS control
		shouldAnimate = false;
		if (sheetElement) {
			sheetElement.style.transform = 'translateY(0)';
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
			sheetElement.style.transition = 'none';
			sheetElement.style.transform = `translateY(${currentDragY}px)`;
		}
	}

	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;
		isDraggingFromContent = false;

		if (currentDragY > DISMISS_THRESHOLD) {
			// Dismiss the sheet
			close();
		} else {
			// Snap back to original position
			if (sheetElement) {
				sheetElement.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
				sheetElement.style.transform = 'translateY(0)';
			}
			currentDragY = 0;
		}
	}

	// Content area touch events - trigger drag when scrolled to top
	function handleContentTouchStart(event: TouchEvent) {
		if (isClosing) return;
		// Store the start position, we'll decide if it's a drag on move
		dragStartY = event.touches[0].clientY;
		isDraggingFromContent = false;
	}

	function handleContentTouchMove(event: TouchEvent) {
		if (isClosing) return;
		const touchY = event.touches[0].clientY;
		const deltaY = touchY - dragStartY;

		// Check if content is scrolled to top and user is pulling down
		if (contentElement && contentElement.scrollTop <= 0 && deltaY > 0) {
			// Start dragging the sheet
			if (!isDraggingFromContent) {
				isDraggingFromContent = true;
				isDragging = true;
				dragStartY = touchY; // Reset start to current position
				shouldAnimate = false;
				if (sheetElement) {
					sheetElement.style.transform = 'translateY(0)';
				}
			}
			// Prevent the content from scrolling
			event.preventDefault();

			// Update sheet position
			const newDeltaY = touchY - dragStartY;
			currentDragY = Math.max(0, newDeltaY);
			if (sheetElement) {
				sheetElement.style.transition = 'none';
				sheetElement.style.transform = `translateY(${currentDragY}px)`;
			}
		} else if (isDraggingFromContent && isDragging) {
			// Continue dragging if we already started
			event.preventDefault();
			const newDeltaY = touchY - dragStartY;
			currentDragY = Math.max(0, newDeltaY);
			if (sheetElement) {
				sheetElement.style.transition = 'none';
				sheetElement.style.transform = `translateY(${currentDragY}px)`;
			}
		}
	}

	function handleContentTouchEnd() {
		if (!isDraggingFromContent) return;
		isDragging = false;
		isDraggingFromContent = false;

		if (currentDragY > DISMISS_THRESHOLD) {
			close();
		} else {
			if (sheetElement) {
				sheetElement.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
				sheetElement.style.transform = 'translateY(0)';
			}
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
		bind:this={sheetElement}
		class="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl bg-background shadow-xl"
		class:sheet-enter={shouldAnimate}
		on:animationend={handleAnimationEnd}
		role="dialog"
		aria-modal="true"
		aria-labelledby="bottom-sheet-title"
	>
		<!-- Draggable header area (handle bar + title) -->
		<div
			class="cursor-grab touch-none select-none active:cursor-grabbing"
			on:touchstart={handleTouchStart}
			on:mousedown={handleMouseDown}
			role="slider"
			aria-label="Drag to dismiss"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.min(100, Math.round((currentDragY / DISMISS_THRESHOLD) * 100))}
			tabindex="0"
		>
			<!-- Handle bar -->
			<div class="flex justify-center pb-2 pt-3">
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
					<Button class="p-1" variant="ghost" on:click={handleCloseButtonClick}>
						<X />
					</Button>
				{/if}
			</div>
		</div>

		<!-- Content -->
		<div
			bind:this={contentElement}
			class="flex-1 overflow-y-auto px-4 pb-8"
			on:touchstart={handleContentTouchStart}
			on:touchmove={handleContentTouchMove}
			on:touchend={handleContentTouchEnd}
		>
			<form class="flex h-full flex-col" on:submit|preventDefault={handleSubmit}>
				<slot name="content" />
				<slot />
			</form>
		</div>
	</div>
{/if}

<style>
	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.sheet-enter {
		animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) both;
		will-change: transform;
	}
</style>
