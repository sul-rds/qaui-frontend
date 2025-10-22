<script>
	import { ImageLoader, Loading } from 'carbon-components-svelte';

	import Fields from '$components/Fields.svelte';

	/**
	 * @typedef {Object} QaInterfaceProps
	 * @prop {import('../../lib/pocketbase/generated-types').ImagesResponse} image
	 */

	/** @type {QaInterfaceProps} */
	let { image } = $props();
</script>

<article>
	<section class="fields">
		{#if image.data}
			<Fields data={image.data} />
		{/if}
		<!-- <pre>{JSON.stringify(image.data, null, 2)}</pre> -->
	</section>

	<section class="image">
		<ImageLoader fadeIn src={image.image_url} alt={image.title}>
			<svelte:fragment slot="loading">
				<Loading withOverlay={false} />
			</svelte:fragment>
		</ImageLoader>
	</section>
</article>

<style>
	article {
		display: flex;
		gap: 2rem;
		height: 100%;
		overflow: hidden;
	}

	section {
		width: 50%;
		height: 100%;

		&.fields {
			overflow-y: scroll;
			padding-right: 0.5rem;
		}

		&.image:not(:has(img)) {
			place-content: center;
			display: grid;
		}
	}

	header {
		margin-bottom: 1rem;
	}

	img {
		max-width: 100%;
	}
</style>
