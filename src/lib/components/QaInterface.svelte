<script>
	import { Button, ImageLoader, Loading } from 'carbon-components-svelte';
	import CheckmarkFilled from 'carbon-icons-svelte/lib/CheckmarkFilled.svelte';
	import CheckmarkOutline from 'carbon-icons-svelte/lib/CheckmarkOutline.svelte';
	import Flag from 'carbon-icons-svelte/lib/Flag.svelte';
	import FlagFilled from 'carbon-icons-svelte/lib/FlagFilled.svelte';

	import Fields from '$components/Fields.svelte';

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {ImagesResponse} image
	 * @prop {{ [key: string]: any }} data
	 * @prop {{ [key: string]: any }} originalData
	 * @prop {JSONSchema7} schema
	 * @prop {Function} toggleApproved
	 * @prop {Function} toggleFlagged
	 */

	/** @type {FieldsProps} */
	let { image, data = $bindable(), originalData, schema, toggleApproved, toggleFlagged } = $props();
</script>

<article>
	<section class="fields">
		<Fields bind:data {originalData} {schema} />
		<div class="actions">
			<Button
				kind="secondary"
				expressive
				disabled={!image.modified}
				onclick={() => (data = structuredClone($state.snapshot(originalData)))}
			>
				Revert
			</Button>
			<Button
				kind="secondary"
				icon={image.flagged || false ? Flag : FlagFilled}
				expressive
				onclick={() => toggleFlagged()}
			>
				{image.flagged ? 'Unflag' : 'Flag'}
			</Button>
			<Button
				icon={image.approved ? CheckmarkOutline : CheckmarkFilled}
				expressive
				onclick={() => toggleApproved()}
			>
				{image.approved ? 'Unapprove' : 'Approve'}
			</Button>
		</div>
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
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
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

	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: end;

		:global(button) {
			min-width: 12rem;
		}
	}

	header {
		margin-bottom: 1rem;
	}
</style>
