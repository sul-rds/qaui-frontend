<script>
	import { diffArrays, deepEqual, similarity } from '$lib/utils';

	import Field from '$components/Field.svelte';
	import Fields from '$components/Fields.svelte';
	import FieldInfoAnnotation from '$components/FieldInfoAnnotation.svelte';

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {string|number} [label]
	 * @prop {JSONSchema7} schema
	 * @prop {{ [key: string]: any }} data
	 * @prop {{ [key: string]: any }} originalData
	 * @prop {DiffStatus} [status]
	 * @prop {Function} [onDelete]
	 * @prop {Function} [onReset]
	 */

	/** @type {FieldsProps} */
	let { label, schema, data = $bindable(), originalData, status, onDelete, onReset } = $props();

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

	const /** @type {string[]} */ orderedKeys = [];
	for (const key in schema.properties) {
		orderedKeys.push(key);
	}

	// Add any remaining data keys that weren't in the schema
	for (const key in data) {
		if (!orderedKeys.includes(key)) {
			orderedKeys.push(key);
		}
	}

	const type = $derived(
		Array.isArray(data)
			? 'array'
			: data !== null && typeof data === 'object'
				? 'object'
				: 'primitive'
	);

	/** @type {DiffEntry<any>[]|false} */
	const arrayDiff = $derived(
		type === 'array' &&
			diffArrays(
				/** @type {any[]} */ (originalData),
				/** @type {any[]} */ (data),
				deepEqual,
				similarity
			)
	);
</script>

{#if type === 'primitive'}
	<Field
		{label}
		{schema}
		bind:value={data}
		originalValue={originalData}
		{status}
		{onDelete}
		{onReset}
	/>
{:else if type === 'object'}
	{#if label !== undefined}
		<details open>
			<summary>
				{#if schema.description}<FieldInfoAnnotation description={schema.description} />{/if}
				{label}
			</summary>
			{#each orderedKeys as key (key)}
				{@const objectSchema = /** @type {JSONSchema7} */ (schema.properties?.[key])}
				<Fields
					bind:data={data[key]}
					originalData={originalData?.[key]}
					schema={objectSchema}
					label={key}
				/>
			{/each}
		</details>
	{:else}
		{#each orderedKeys as key (key)}
			{@const objectSchema = /** @type {JSONSchema7} */ (schema.properties?.[key])}
			<Fields
				bind:data={data[key]}
				originalData={originalData?.[key]}
				schema={objectSchema}
				label={key}
			/>
		{/each}
	{/if}
{:else if type === 'array'}
	{@const _arrayDiff = /** @type {DiffEntry<any>[]} */ (arrayDiff)}
	{@const itemSchema = /** @type {JSONSchema7} */ (
		Array.isArray(schema?.items) ? schema.items[0] : schema?.items
	)}
	<details open>
		<summary>
			{#if itemSchema.description}
				<FieldInfoAnnotation description={itemSchema.description} />
			{/if}
			{label}
		</summary>
		{#each _arrayDiff as item, i (i)}
			{#if item.status === 'removed'}
				<Fields
					data={item.value}
					originalData={item.value}
					schema={itemSchema}
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
					schema={itemSchema}
					label={item.index === null ? undefined : item.index + 1}
					onDelete={() => data.splice(item.index, 1)}
					status={item.status}
				/>
			{/if}
		{/each}
	</details>
	<!-- <button onclick={() => value.push(inferEmptyValue(value))}>+ Add item</button> -->
{/if}

<style>
	details {
		padding: 1rem;
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 1);
	}

	summary {
		cursor: pointer;
		position: relative;
		margin: -1rem;
		padding: 1rem;

		&:hover {
			background-color: rgba(0, 0, 0, 0.1);
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
