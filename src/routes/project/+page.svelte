<script>
	/**
	 * @typedef {import('../../lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
	 */

	import { page } from '$app/state';
	import { ImageLoader, InlineNotification } from 'carbon-components-svelte';
	import { CheckmarkFilled, CheckmarkOutline } from 'carbon-icons-svelte';

	import { pb, getProjectById, getImagesByProjectId } from '$lib/pocketbase';
	import { tooltip } from '$lib/actions/tooltip';

	let isLoggedIn = $state(pb.authStore.isValid);
	let project = $state();
	/** @type {Promise<ImagesResponse[]>|ImagesResponse[]} */
	let projectImages = $state([]);

	const projectId = page.url.searchParams.get('projectId');
	if (projectId) {
		project = getProjectById(projectId);
		projectImages = getImagesByProjectId(projectId);
	}
</script>

<svelte:head>
	{#if !projectId}
		<title>No Project Specified</title>
	{:else}
		{#await project then project}
			<title>{project?.name}</title>
		{:catch error}
			<title>Invalid Project ID</title>
		{/await}
	{/if}
	<meta name="description" content="" />
</svelte:head>

{#if !projectId}
	<InlineNotification lowContrast hideCloseButton kind="error" title="No Project specified"
	></InlineNotification>
{/if}
{#await project then project}
	<h3>{project?.name}</h3>
	{#await projectImages then images}
		Images: {images.length}
		Modified: {images.filter((image) => image.modified).length}
		Approved: {images.filter((image) => image.approved).length}

		<section class="thumbnails">
			{#each images as image (image.id)}
				<a href="image/?imageId={image.id}">
					<article>
						<ImageLoader
							fadeIn
							src={image.image_url.replace('full/full', 'full/150,')}
							alt={image.title}
						/>
						<p>{image.title}</p>

						{#if image.modified || image.approved}
							<p class="overlay">
								{#if image.modified}
									<span use:tooltip={{ content: 'Modified' }}><CheckmarkOutline /></span>
								{/if}
								{#if image.approved}
									<span use:tooltip={{ content: 'Approved' }}><CheckmarkFilled /></span>
								{/if}
							</p>
						{/if}
					</article>
				</a>
			{/each}
		</section>
	{/await}
{:catch error}
	<InlineNotification lowContrast hideCloseButton kind="error" title="Invalid Project ID">
		<span slot="subtitle">
			Project "<span style="font-family:monospace">{projectId}</span>" could not be loaded.
		</span>
	</InlineNotification>

	<section>
		{#if !isLoggedIn}
			<p>
				Note: you must be <a href="/login">logged in</a> to view projects.
			</p>
		{/if}
	</section>
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
