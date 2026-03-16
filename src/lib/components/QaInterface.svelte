<script>
	import { ImageLoader, Loading } from 'carbon-components-svelte';
	import { getContext } from 'svelte';
	import Fields from '$components/Fields.svelte';

	const imageData = getContext('imageData');
	const image = imageData.image;
	const committedData = imageData.image.data;
	const originalData = imageData.image.original_data;
	const schema = imageData.project.schema;

	let data = $state(structuredClone($state.snapshot(committedData)));
</script>

<article>
	<section class="fields">
		{#if data}
			<Fields bind:data {originalData} {schema} />
		{/if}
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

		&.image {
			overflow-y: auto;
		}

		&.image:not(:has(img)) {
			place-content: center;
			display: grid;
		}
	}

	header {
		margin-bottom: 1rem;
	}
</style>
