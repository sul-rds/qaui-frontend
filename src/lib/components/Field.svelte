<script>
	import { Button } from 'carbon-components-svelte';
	import Information from 'carbon-icons-svelte/lib/Information.svelte';
	import Undo from 'carbon-icons-svelte/lib/Undo.svelte';

	import { tooltip } from '$lib/actions/tooltip';

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {string} key
	 * @prop {Object} value
	 * @prop {Object} originalValue
	 * @prop {JSONSchema7} schema
	 */

	/** @type {FieldsProps} */
	let { key, value = $bindable(), originalValue, schema } = $props();

	let input = $state();
	let modified = $derived(value !== originalValue);

	/**
	 * @param {JSONSchema7} schema
	 * @param {string} key
	 */
	const getDescription = (schema, key) => {
		if (schema && schema.type === 'object') {
			const prop = schema.properties?.[key];
			return typeof prop === 'object' && prop ? prop.description : undefined;
		}
	};
	const description = getDescription(schema, key);

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
		if (!input) return;
		setTimeout(() => input.focus());
	}}
>
	{#if description}
		<span class="i" use:tooltip={{ content: description }}><Information /></span>
	{:else}
		<span class="i"></span>
	{/if}
	{key}:
	<span
		class="value"
		class:modified
		contenteditable
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
	{#if modified}
		<Button
			iconDescription="Revert"
			icon={Undo}
			size="small"
			onclick={() => (value = originalValue)}
		/>
	{/if}
</div>

<style>
	span.i {
		cursor: help;
		display: inline-block;
		min-width: 0.75rem;
		opacity: 0.5;

		&:hover {
			opacity: 1;
		}

		> :global(svg) {
			height: 0.75rem;
			width: 0.75rem;
		}
	}

	div.field {
		align-items: stretch;
		display: flex;
		flex-wrap: wrap;
		font-size: 1rem;
		gap: 0.5rem 0.25rem;
		margin: 0.15rem 0;
		padding: 0.25rem 0;
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
	}

	:global(.bx--btn--sm) {
		margin: -0.25rem 0 -0.25rem;
		min-height: unset;
	}
</style>
