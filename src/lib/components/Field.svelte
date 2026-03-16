<script>
	import Information from 'carbon-icons-svelte/lib/Information.svelte';

	import { tooltip } from '$lib/actions/tooltip';

	/** @typedef {import('json-schema').JSONSchema7} JSONSchema7 */

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
	{#if typeof value === 'string'}
		<span
			class="value"
			class:edited={value !== originalValue}
			contenteditable
			bind:this={input}
			bind:textContent={value}
			onfocus={(evt) => selectText(/** @type {HTMLSpanElement} */ (evt.target))}
		></span>
	{:else}
		{value}
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
		display: flex;
		font-size: 1rem;
		gap: 0.25rem;
		margin: 0.15rem 0;
		padding: 0.25rem 0;
	}

	span.value {
		background-color: rgba(255, 255, 255, 0.4);
		flex: 1 1 0px;
		margin: -0.25rem 0 -0.25rem 0.5rem;
		padding: 0.25rem;

		&.edited {
			background-color: hsl(from var(--primary) h s 85%);
			outline: 2px dotted var(--primary);
		}
	}
</style>
