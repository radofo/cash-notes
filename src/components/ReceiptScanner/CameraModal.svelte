<script lang="ts">
	import { Camera, X, Loader2, Image } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import Modal from '../Modal.svelte';
	import Button from '../Button.svelte';
	import type { ParsedReceipt } from '../../types/receipt';
	import { geminiApiKey } from '../../stores/gemini';

	export let showModal = false;

	const dispatch = createEventDispatcher<{
		receiptParsed: ParsedReceipt;
	}>();

	let isLoading = false;
	let error: string | null = null;
	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let stream: MediaStream | null = null;
	let capturedImage: string | null = null;
	let fileInput: HTMLInputElement;

	export async function startCamera() {
		showModal = true;
		capturedImage = null;
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
		capturedImage = canvasElement.toDataURL('image/jpeg', 0.8);
		stopStream();
	}

	function retakePhoto() {
		capturedImage = null;
		error = null;
		startCamera();
	}

	function stopStream() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	}

	function closeModal() {
		stopStream();
		showModal = false;
		capturedImage = null;
		error = null;
	}

	async function parseReceipt() {
		if (!capturedImage) return;

		isLoading = true;
		error = null;

		try {
			const response = await fetch('/api/parse-receipt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					imageBase64: capturedImage,
					apiKey: $geminiApiKey
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Fehler beim Parsen des Kassenbons');
			}

			dispatch('receiptParsed', data.receipt);
			closeModal();
		} catch (err) {
			console.error('Error parsing receipt:', err);
			error = err instanceof Error ? err.message : 'Fehler beim Parsen des Kassenbons';
		} finally {
			isLoading = false;
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			capturedImage = e.target?.result as string;
			stopStream();
		};
		reader.readAsDataURL(file);
	}

	export function openFilePicker() {
		showModal = true;
		capturedImage = null;
		error = null;
		fileInput?.click();
	}
</script>

<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	class="hidden"
	on:change={handleFileSelect}
/>

<Modal bind:showModal>
	<div slot="header" class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Kassenbon scannen</h2>
		<button on:click={closeModal} class="p-1">
			<X size={20} />
		</button>
	</div>

	<div class="flex flex-col gap-4">
		{#if error}
			<div class="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
				{error}
			</div>
		{/if}

		{#if !capturedImage}
			<div class="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-black">
				<!-- svelte-ignore a11y-media-has-caption -->
				<video
					bind:this={videoElement}
					class="h-full w-full object-cover"
					playsinline
					autoplay
					muted
				/>
			</div>
			<canvas bind:this={canvasElement} class="hidden" />
			<div class="flex gap-2">
				<Button fullWidth variant="dashed" on:btnclick={() => fileInput?.click()}>
					<Image size={18} />
					Galerie
				</Button>
				<Button fullWidth on:btnclick={capturePhoto}>
					<Camera size={18} />
					Foto aufnehmen
				</Button>
			</div>
		{:else}
			<div class="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
				<img src={capturedImage} alt="Aufgenommener Kassenbon" class="h-full w-full object-cover" />
			</div>
			<div class="flex gap-2">
				<Button fullWidth variant="dashed" on:btnclick={retakePhoto} disabled={isLoading}>
					Neu aufnehmen
				</Button>
				<Button fullWidth on:btnclick={parseReceipt} disabled={isLoading}>
					{#if isLoading}
						<Loader2 size={18} class="animate-spin" />
						Wird analysiert...
					{:else}
						Analysieren
					{/if}
				</Button>
			</div>
		{/if}
	</div>
</Modal>
