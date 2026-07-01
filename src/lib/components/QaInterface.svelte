<script>
	import { Button, ImageLoader, Loading, TextArea } from 'carbon-components-svelte';
	import { slide } from 'svelte/transition';

	import { Approved, Flagged, Unapproved, Unflagged, Reset, Notes } from '$lib/icons';

	import Fields from '$components/Fields.svelte';

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {ImageWithApprovedBy} image
	 * @prop {{ [key: string]: any }} data
	 * @prop {{ [key: string]: any }} originalData
	 * @prop {JSONSchema7} schema
	 * @prop {Function} toggleApproved
	 * @prop {Function} toggleFlagged
	 */

	/** @type {FieldsProps} */
	let {
		image = $bindable(),
		data = $bindable(),
		originalData,
		schema,
		toggleApproved,
		toggleFlagged
	} = $props();

	let showNotesPanel = $state(sessionStorage.getItem('qa-notes-panel') === 'true');

	$effect(() => {
		sessionStorage.setItem('qa-notes-panel', String(showNotesPanel));
	});
</script>

{#if showNotesPanel}
	<section class="notes-panel" transition:slide={{ duration: 200 }}>
		<dl>
			<dt>Title</dt>
			<dd>{image.title}</dd>
			<dt>Original Data Source</dt>
			<dd>{image.data_source ?? '—'}</dd>
			<dt>Created</dt>
			<dd>{image.created}</dd>
			<dt>Last Updated</dt>
			<dd>{image.updated}</dd>
			{#if image.approved_by}
				<dt>Approved By</dt>
				<dd>{image.expand.approved_by.name}</dd>
			{/if}
		</dl>
		<TextArea light placeholder="Image Notes..." bind:value={image.notes} />
	</section>
{/if}
<article>
	<section class="fields">
		<div class="actions">
			<Button
				size="small"
				kind="tertiary"
				icon={Notes}
				expressive
				onclick={() => (showNotesPanel = !showNotesPanel)}
			>
				{showNotesPanel ? 'Hide Notes' : 'Notes'}
			</Button>
			<Button
				size="small"
				kind="danger"
				icon={Reset}
				expressive
				disabled={!image.modified}
				onclick={() => (data = structuredClone($state.snapshot(originalData)))}
			>
				Revert
			</Button>
			<Button
				size="small"
				kind="secondary"
				icon={image.flagged || false ? Unflagged : Flagged}
				expressive
				onclick={() => toggleFlagged()}
			>
				{image.flagged ? 'Unflag' : 'Flag'}
			</Button>
			<Button
				size="small"
				icon={image.approved ? Unapproved : Approved}
				expressive
				onclick={() => toggleApproved()}
			>
				{image.approved ? 'Unapprove' : 'Approve'}
			</Button>
		</div>
		<Fields bind:data {originalData} {schema} top={true} />
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
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: end;

		:global(button) {
			margin: 0;
		}
	}

	.notes-panel {
		align-items: start;
		background: rgba(0, 0, 0, 0.1);
		display: flex;
		gap: 1rem;
		padding: 1rem;
		width: 100%;

		dl {
			display: grid;
			gap: 0.25rem 1rem;
			grid-template-columns: auto 1fr;
			margin: 0;

			dt {
				font-weight: 600;
			}

			dd {
				margin: 0;
				padding: 0.25rem 0;
			}
		}
	}
</style>
