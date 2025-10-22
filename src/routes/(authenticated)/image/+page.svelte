<script>
	/**
	 * @typedef {import('../../../lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
	 */

	import { page } from '$app/state';
	import { Button, InlineNotification } from 'carbon-components-svelte';
	import { ArrowRight, ArrowLeft } from 'carbon-icons-svelte';

	import { pb, getImageById } from '$lib/pocketbase';

	import QaInterface from '$components/QaInterface.svelte';

	let isLoggedIn = $state(pb.authStore.isValid);
	/** @type {Promise<ImagesResponse>|ImagesResponse|undefined} */
	let image = $state();

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
<div class="toolbar">
	<Button size="small" kind="ghost" iconDescription="Previous Image" icon={ArrowLeft} />
	{#await image then image}<h3>{image?.title}</h3>{/await}
	<Button size="small" kind="ghost" iconDescription="Next Image" icon={ArrowRight} />
</div>
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
