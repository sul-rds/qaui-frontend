<script>
	import { tick } from 'svelte';

	import { Button } from 'carbon-components-svelte';

	import { tooltip } from '$lib/actions/tooltip';
	import { Add } from '$lib/icons';
	import { diffArrays, deepEqual, inferEmptyValue, similarity } from '$lib/utils';

	import Fields from '$lib/components/Fields.svelte';
	import FieldInfoAnnotation from '$lib/components/Fields/FieldInfoAnnotation.svelte';

	/**
	 * @typedef {Object} ArrayFieldProps
	 * @prop {string|number} [label]
	 * @prop {JSONSchema7} schema
	 * @prop {any} data
	 * @prop {any} originalData
	 */

	/** @type {ArrayFieldProps} */
	let { label, schema, data = $bindable(), originalData } = $props();

	let details = $state();

	/** @type {any[]} */
	const dataArray = $derived(/** @type {any[]} */ (data));

	/** @type {any[]} */
	const originalArray = $derived(/** @type {any[]} */ (originalData));

	/** @type {DiffEntry<any>[]} */
	const arrayDiff = $derived(diffArrays(originalArray, dataArray, deepEqual, similarity));

	const itemSchema = $derived(
		/** @type {JSONSchema7} */ (Array.isArray(schema.items) ? schema.items[0] : schema.items)
	);

	const addItem = async () => {
		data.push(inferEmptyValue(itemSchema));
		details.open = true;
		await tick();
		const newItem = details.children[details.childElementCount - 1];
		newItem.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
		newItem.querySelector('.value').focus();
	};

	/**
	 * @param {DiffEntry<any>} item
	 * @param {number} diffIndex
	 */
	const restoreRemoved = (item, diffIndex) => {
		if (!arrayDiff || !item.originalIndex) return;
		const predecessor = [...arrayDiff.slice(0, diffIndex)].reverse().find((e) => e.index !== null);
		const insertAt = predecessor?.index ? predecessor.index + 1 : 0;
		data.splice(insertAt, 0, structuredClone(originalData[item.originalIndex]));
	};
</script>

<details open bind:this={details}>
	<summary>
		{#if itemSchema && typeof itemSchema === 'object' && itemSchema.description}
			<FieldInfoAnnotation description={itemSchema.description} />
		{/if}
		{label}
		<Button iconDescription="Add Item" icon={Add} size="small" on:click={addItem} />
	</summary>
	{#each arrayDiff as item, i (i)}
		{@const _itemSchema = itemSchema}
		{#if item.status === 'removed'}
			<Fields
				data={item.value}
				originalData={item.value}
				schema={_itemSchema}
				label={item.index === null ? undefined : item.index + 1}
				onDelete={() => data.splice(item.index, 1)}
				onReset={() => restoreRemoved(item, i)}
				status={item.status}
			/>
		{:else}
			<Fields
				bind:data={data[/** @type {number} */ (item.index)]}
				originalData={item.status === 'modified'
					? originalData?.[/** @type {number} */ (item.originalIndex)]
					: originalData?.[/** @type {number} */ (item.index)]}
				schema={_itemSchema}
				label={item.index === null ? undefined : item.index + 1}
				onDelete={() => data.splice(item.index, 1)}
				status={item.status}
			/>
		{/if}
	{:else}
		<span>[No items]</span>
	{/each}
</details>

<style>
	details {
		padding: 1rem;
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 1);

		> span {
			opacity: 0.5;
			margin-left: 1.5rem;
		}
	}

	summary {
		cursor: pointer;
		position: relative;
		margin: -1rem;
		padding: 1rem;

		&:hover {
			background-color: rgba(0, 0, 0, 0.1);
		}

		:global(button) {
			float: right;
		}
	}

	details[open] > summary {
		margin-bottom: 1rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);

		&:hover {
			border-bottom: 1px solid rgba(0, 0, 0, 1);
		}
	}

	details[open] > :global(details) {
		border-top: 1px solid rgba(0, 0, 0, 1);
		margin-top: 1rem;
	}
</style>
