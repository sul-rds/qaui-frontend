<script>
	import { resolve } from '$app/paths';
	import { ImageLoader } from 'carbon-components-svelte';
	import { tooltip } from '$lib/actions/tooltip';
	import { Approved, Modified, Flagged } from '$lib/icons';

	/**
	 * @typedef {import('$lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
	 */

	/**
	 * @typedef {Object} ImageGridProps
	 * @prop {ImagesResponse[]} images
	 */

	/** @type {ImageGridProps} */
	let { images } = $props();
</script>

Images: {images.length}
Flagged: {images.filter((image) => image.flagged).length}
Modified: {images.filter((image) => image.modified).length}
Approved: {images.filter((image) => image.approved).length}

<section>
	{#each images as image (image.id)}
		<a href="{resolve('/image')}?imageId={image.id}">
			<article>
				<ImageLoader
					fadeIn
					src={image.image_url.replace('full/full', 'full/150,')}
					alt={image.title}
				/>
				<p>{image.title}</p>

				{#if image.modified || image.approved}
					<p class="overlay">
						{#if image.flagged}
							<span use:tooltip={{ content: 'Flagged' }}><Flagged /></span>
						{/if}
						{#if image.modified}
							<span use:tooltip={{ content: 'Modified' }}><Modified /></span>
						{/if}
						{#if image.approved}
							<span use:tooltip={{ content: 'Approved' }}><Approved /></span>
						{/if}
					</p>
				{/if}
			</article>
		</a>
	{/each}
</section>

<style>
	section {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		margin: 2rem;

		article {
			position: relative;
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
