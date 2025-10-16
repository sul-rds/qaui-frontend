<script>
	/**
	 * @typedef {import('../../lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
	 */

	import { page } from '$app/state';
	import { ImageLoader, InlineNotification } from 'carbon-components-svelte';
	import { CheckmarkFilled, CheckmarkOutline } from 'carbon-icons-svelte';

	import { pb, getProjectById, getImagesByProjectId, getImageById } from '$lib/pocketbase';
	import { tooltip } from '$lib/actions/tooltip';

	import QaInterface from '$components/QaInterface.svelte';

	let isLoggedIn = $state(pb.authStore.isValid);
	// let project = $state();
	/** @type {Promise<ImagesResponse>|ImagesResponse|undefined} */
	let image = $state();
	// /** @type {Promise<ImagesResponse[]>|ImagesResponse[]} */
	// let projectImages = $state([]);

	const imageId = page.url.searchParams.get('imageId');
	if (imageId) {
		image = getImageById(imageId);
	}
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

{#if !imageId}
	<InlineNotification lowContrast hideCloseButton kind="error" title="No Project specified"
	></InlineNotification>
{/if}
{#await image then image}
	{#if image}
		<QaInterface {image} />
	{/if}
{:catch error}
	<InlineNotification lowContrast hideCloseButton kind="error" title="Invalid Image ID">
		<span slot="subtitle">
			Image "<span style="font-family:monospace">{imageId}</span>" could not be loaded.
		</span>
	</InlineNotification>
	{#if !isLoggedIn}
		<section>
			<p>
				Note: you must be <a href="/login">logged in</a> to view projects.
			</p>
		</section>
	{/if}
{/await}

<style>
	.thumbnails {
		margin: 2rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;

		article {
			position: relative;
		}

		:global(img) {
			width: fit-content !important;
		}

		p {
			max-width: 150px;
			text-overflow: ellipsis;
			overflow: hidden;
		}

		.overlay {
			position: absolute;
			right: 0;
			top: 0;
			background-color: rgba(0, 0, 0, 0.5);
			color: white;
			padding: 0.5rem;
			z-index: 9;
		}
	}
</style>
