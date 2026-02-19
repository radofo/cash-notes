<script lang="ts">
	import { Camera, X } from 'lucide-svelte';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher<{
		capture: string;
		close: void;
	}>();

	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let stream: MediaStream | null = null;
	let error: string | null = null;

	onMount(() => {
		startCamera();
	});

	onDestroy(() => {
		stopStream();
	});

	async function startCamera() {
		error = null;

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'environment',
					width: { ideal: 1920 },
					height: { ideal: 1080 }
				}
			});

			await new Promise<void>((resolve) => setTimeout(resolve, 100));

			if (videoElement) {
				videoElement.srcObject = stream;
				await videoElement.play();
			}
		} catch (err) {
			console.error('Error accessing camera:', err);
			error = 'Kamerazugriff nicht möglich. Bitte erlaube den Kamerazugriff.';
		}
	}

	function capturePhoto() {
		if (!videoElement || !canvasElement) return;

		const context = canvasElement.getContext('2d');
		if (!context) return;

		canvasElement.width = videoElement.videoWidth;
		canvasElement.height = videoElement.videoHeight;
		context.drawImage(videoElement, 0, 0);
		const capturedImage = canvasElement.toDataURL('image/jpeg', 0.8);
		stopStream();
		dispatch('capture', capturedImage);
	}

	function stopStream() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	}

	function handleClose() {
		stopStream();
		dispatch('close');
	}
</script>

<div class="fixed inset-0 z-50 flex flex-col bg-black">
	<!-- Close button -->
	<button
		on:click={handleClose}
		class="absolute left-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white"
		aria-label="Schließen"
	>
		<X size={24} />
	</button>

	<!-- Camera view -->
	<div class="relative flex-1">
		{#if error}
			<div class="flex h-full items-center justify-center p-4">
				<div
					class="rounded-lg bg-destructive/10 p-4 text-center text-destructive"
					role="alert"
					aria-live="polite"
				>
					{error}
				</div>
			</div>
		{:else}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				bind:this={videoElement}
				class="h-full w-full object-cover"
				playsinline
				autoplay
				muted
			/>
		{/if}
	</div>

	<!-- Shutter button -->
	<div class="flex items-center justify-center bg-black p-6 pb-10">
		<button
			on:click={capturePhoto}
			disabled={!!error}
			class="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
			aria-label="Foto aufnehmen"
		>
			<Camera size={32} class="text-white" />
		</button>
	</div>

	<canvas bind:this={canvasElement} class="hidden" />
</div>
