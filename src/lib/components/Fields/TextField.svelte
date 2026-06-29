<script>
	import { Button } from 'carbon-components-svelte';

	import { tooltip } from '$lib/actions/tooltip';
	import { Delete, Undo } from '$lib/icons';

	import FieldInfoAnnotation from '$lib/components/Fields/FieldInfoAnnotation.svelte';

	/**
	 * @typedef {Object} FieldProps
	 * @prop {string|number|undefined} label
	 * @prop {JSONSchema7} schema
	 * @prop {Object} value
	 * @prop {Object} originalValue
	 * @prop {DiffStatus} [status]
	 * @prop {Function} [onDelete]
	 * @prop {Function} [onReset]
	 */

	/** @type {FieldProps} */
	let { label, schema, value = $bindable(), originalValue, status, onDelete, onReset } = $props();

	let input = $state();
	let modified = $derived(value !== originalValue);

	const selectText = (/** @type {HTMLSpanElement} */ el) => {
		const range = document.createRange();
		range.selectNodeContents(el);
		const selection = window.getSelection();
		if (selection === null) return;
		selection.removeAllRanges();
		selection.addRange(range);
	};

	// bind:textContent doesn't handle null semantics properly
	//  (null is immediately converted to the empty string, which is propagated
	//   back up to the route controller and triggers a save)
	$effect(() => {
		if (input && input.textContent !== (value ?? '')) {
			// eslint-disable-next-line svelte/no-dom-manipulating
			input.textContent = value ?? '';
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="field"
	onclick={() => {
		if (!input || !input.focus) return;
		setTimeout(() => input?.focus());
	}}
>
	{#if typeof label === 'string'}
		<FieldInfoAnnotation description={schema.description} />
	{/if}
	<span class="label">{label}:</span>
	<span
		class="value"
		class:modified={status === 'modified' || (status === undefined && modified)}
		class:removed={status === 'removed'}
		class:added={status === 'added'}
		contenteditable={status !== 'removed'}
		use:tooltip={{
			content: `Original value: ${originalValue}`,
			placement: 'top-start',
			enabled: modified
		}}
		bind:this={input}
		oninput={() => (value = input.textContent === '' ? null : input.textContent)}
		onfocus={(/** @type {FocusEvent} */ evt) =>
			selectText(/** @type {HTMLSpanElement} */ (evt.target))}
	>
	</span>
	{#if status === 'modified' || status === 'removed' || (status === undefined && modified)}
		<Button
			iconDescription="Revert"
			icon={Undo}
			size="small"
			onclick={onReset ? () => onReset() : () => (value = originalValue)}
		/>
	{/if}
	{#if onDelete}
		<Button
			iconDescription="Delete"
			icon={Delete}
			size="small"
			on:click={() => onDelete()}
			disabled={status === 'removed'}
		/>
	{/if}
</div>

<style>
	div.field {
		align-items: stretch;
		display: flex;
		flex-wrap: wrap;
		font-size: 1rem;
		gap: 0.5rem 0.25rem;
		margin: 0.15rem 0;
		padding: 0.25rem 0;
	}

	span.label {
		display: inline-block;
		min-width: 1.5rem;
		text-align: right;
	}

	span.value {
		background-color: rgba(255, 255, 255, 0.4);
		flex: 1 1 0px;
		line-height: 1.25;
		margin: -0.25rem 0 -0.25rem 0.5rem;
		min-width: 50%;
		padding: 0.25rem;

		&.modified {
			background-color: hsl(from var(--primary) h s 85%);
			outline: 2px dotted var(--primary);
		}

		&.added {
			background-color: hsl(from var(--added) h s 85%);
			outline: 2px dotted var(--added);
		}

		&.removed {
			background-color: hsl(from var(--removed) h s 85%);
			opacity: 0.6;
			outline: 2px dotted var(--removed);
			text-decoration: line-through;
		}
	}

	:global(.bx--btn--sm) {
		margin: -0.25rem 0 -0.25rem;
		min-height: unset;
	}
</style>
