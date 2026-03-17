<script>
	/**
	 * @typedef {import('$lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
	 */
	import { page } from '$app/state';
	import { Button, InlineNotification, Loading } from 'carbon-components-svelte';
	import { ArrowRight, ArrowLeft } from 'carbon-icons-svelte';
	import {
		getProjectById,
		getImageById,
		getImagesByProjectId,
		updateImageRecord
	} from '$lib/pocketbase';
	import { debounce, deepEqual } from '$lib/utils';

	import QaInterface from '$components/QaInterface.svelte';

	let image = $state();
	let project = $state();
	let loading = $state(true);
	let saving = $state(false);
	let error = $state();
	let nextImage = $state();
	let previousImage = $state();

	async function loadData(/** @type {string} */ imageId) {
		loading = true;
		error = null;
		try {
			image = await getImageById(imageId);
			project = await getProjectById(image.project);
		} catch (e) {
			error = e;
		} finally {
			loading = false;
			const projectImages = await getImagesByProjectId(image.project);
			const currentIndex = projectImages.findIndex((i) => i.id === image.id);
			previousImage = projectImages[currentIndex - 1];
			nextImage = projectImages[currentIndex + 1];
		}
	}

	let initialized = false;
	// eslint-disable-next-line svelte/prefer-writable-derived
	let data = $state({});

	const debouncedSave = debounce(() => {
		console.log('Saving...');
		const modified = !deepEqual($state.snapshot(data), $state.snapshot(image.original_data));
		updateImageRecord(image.id, {
			data: $state.snapshot(data),
			modified: modified
		}).then(() => (saving = false));
	}, 500);

	$effect(() => {
		data = structuredClone($state.snapshot(image?.data));
	});

	$effect(() => {
		JSON.stringify(data);
		if (!data) return;
		if (!initialized) {
			initialized = true;
			return;
		}
		saving = true;
		debouncedSave();
		return () => debouncedSave.cancel();
	});

	loadData(page.url.searchParams.get('imageId') || '');
</script>

{#if loading}
	<p>Loading...</p>
{:else if error}
	<InlineNotification lowContrast hideCloseButton kind="error" title="Invalid Image ID">
		<span slot="subtitle">
			Image "<span style="font-family:monospace">{page.url.searchParams.get('imageId')}</span>"
			could not be loaded.
		</span>
	</InlineNotification>
{:else if image && project}
	<div class="toolbar">
		<Button
			size="small"
			kind="ghost"
			iconDescription="Previous Image"
			icon={ArrowLeft}
			disabled={!previousImage}
			href="image?imageId={previousImage?.id}"
			onclick={() => loadData(previousImage.id)}
		/>
		<div class="toolbar-center">
			{#await image then image}<h3>{image?.title}</h3>{/await}
			<div class:hidden={!saving}><Loading withOverlay={false} small /></div>
		</div>
		<Button
			size="small"
			kind="ghost"
			iconDescription="Next Image"
			icon={ArrowRight}
			disabled={!nextImage}
			href="image?imageId={nextImage?.id}"
			onclick={() => loadData(nextImage.id)}
		/>
	</div>
	<QaInterface {image} bind:data originalData={image.original_data} schema={project.schema} />
{/if}

<style>
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		background-color: var(--primary);
		margin-bottom: 1rem;
		color: white;
		border-radius: 0.5rem;
		padding: 0.25rem 1rem;
		margin-top: -1rem;

		:global(.bx--btn--ghost path) {
			fill: white;
		}

		.toolbar-center {
			display: flex;
			gap: 1rem;
			align-items: center;
		}

		.hidden {
			visibility: hidden;
		}
	}

	h3 {
		margin: 0;
		font-size: 1.5rem;
	}
</style>
