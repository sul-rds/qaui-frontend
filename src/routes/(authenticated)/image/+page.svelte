<script>
	/**
	 * @typedef {import('../../../lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
	 */
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import { Button, InlineNotification } from 'carbon-components-svelte';
	import { ArrowRight, ArrowLeft } from 'carbon-icons-svelte';

	import { getProjectById, getImageById, getImagesByProjectId } from '$lib/pocketbase';

	import QaInterface from '$components/QaInterface.svelte';

	let image = $state();
	let project = $state();
	let loading = $state(true);
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

	setContext('imageData', {
		get image() {
			return image;
		},
		get project() {
			return project;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		reload: loadData
	});

	loadData(page.url.searchParams.get('imageId') || '');
</script>

<!-- 
<svelte:head>
	{#if !imageId}
		<title>No Project Specified</title>
	{:else}
		{#await project then project}
			<title>{project?.name}</title>
		{:catch error}
			<title>Invalid Project ID</title>
		{/await}
	{/if}
	<meta name="description" content="" />
</svelte:head> -->

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
		{#await image then image}<h3>{image?.title}</h3>{/await}
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
	<QaInterface />
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
	}

	h3 {
		margin: 0;
		font-size: 1.5rem;
	}
</style>
