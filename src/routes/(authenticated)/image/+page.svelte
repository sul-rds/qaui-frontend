<script>
	/**
	 * @typedef {import('../../../lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
	 */
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import { Button, InlineNotification } from 'carbon-components-svelte';
	import { ArrowRight, ArrowLeft } from 'carbon-icons-svelte';

	import { getProjectById, getImageById } from '$lib/pocketbase';

	import QaInterface from '$components/QaInterface.svelte';

	const imageId = page.url.searchParams.get('imageId');

	let image = $state();
	let project = $state();
	let loading = $state(true);
	let error = $state();

	async function loadData() {
		loading = true;
		error = null;
		try {
			image = await getImageById(imageId);
			project = await getProjectById(image.project);
		} catch (e) {
			error = e;
		} finally {
			loading = false;
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

	loadData();
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
			Image "<span style="font-family:monospace">{imageId}</span>" could not be loaded.
		</span>
	</InlineNotification>
{:else if image && project}
	<div class="toolbar">
		<Button size="small" kind="ghost" iconDescription="Previous Image" icon={ArrowLeft} />
		{#await image then image}<h3>{image?.title}</h3>{/await}
		<Button size="small" kind="ghost" iconDescription="Next Image" icon={ArrowRight} />
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
