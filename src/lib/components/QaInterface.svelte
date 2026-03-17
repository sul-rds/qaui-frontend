<script>
	import { ImageLoader, Loading } from 'carbon-components-svelte';
	import Fields from '$components/Fields.svelte';

	/**
	 * @typedef {import('$lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
	 * @typedef {import('json-schema').JSONSchema7} JSONSchema7
	 */

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {ImagesResponse} image
	 * @prop {{ [key: string]: any }} data
	 * @prop {{ [key: string]: any }} originalData
	 * @prop {JSONSchema7} schema
	 */

	/** @type {FieldsProps} */
	let { image, data = $bindable(), originalData, schema } = $props();
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
