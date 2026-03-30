<script>
	import { diffArrays, deepEqual } from '$lib/utils';

	import Field from '$components/Field.svelte';
	import Fields from '$components/Fields.svelte';
	import FieldInfoAnnotation from '$components/FieldInfoAnnotation.svelte';

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {string} [label]
	 * @prop {JSONSchema7} schema
	 * @prop {{ [key: string]: any }} data
	 * @prop {{ [key: string]: any }} originalData
	 * @prop {DiffStatus} status
	 * @prop {Function} [onDelete]
	 * @prop {Function} [onReset]
	 */

	/** @type {FieldsProps} */
	let { label, schema, data = $bindable(), originalData, status, onDelete, onReset } = $props();

	const restoreRemoved = (item, diffIndex, data, originalData) => {
		const diff = diffArrays(originalData, data, deepEqual);
		const predecessor = [...diff.slice(0, diffIndex)].reverse().find((e) => e.index !== null);

		console.log(`predecessor`, predecessor);
		const insertAt = predecessor ? predecessor.index + 1 : 0;
		console.log(`insertAt`, insertAt);
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
				<Fields
					bind:data={data[key]}
					originalData={originalData?.[key]}
					schema={schema.properties?.[key]}
					label={key}
				/>
			{/each}
		</details>
	{:else}
		{#each orderedKeys as key (key)}
			<Fields
				bind:data={data[key]}
				originalData={originalData?.[key]}
				schema={schema.properties?.[key]}
				label={key}
			/>
		{/each}
	{/if}
{:else if type === 'array'}
	<details open>
		<summary>
			{#if schema.items?.description}
				<FieldInfoAnnotation description={schema.items?.description} />
			{/if}
			{label}
		</summary>
		{#each diffArrays(originalData, data, deepEqual) as item, i (i)}
			{#if item.status === 'removed'}
				<Fields
					data={item.value}
					originalData={item.value}
					schema={schema.items}
					label={item.index === null ? null : item.index + 1}
					onDelete={() => data.splice(item.index, 1)}
					onReset={() => restoreRemoved(item, i, data, originalData)}
					status={item.status}
				/>
			{:else}
				<Fields
					bind:data={data[item.index]}
					originalData={item.status === 'modified'
						? originalData?.[item.originalIndex]
						: originalData?.[item.index]}
					schema={schema.items}
					label={item.index === null ? null : item.index + 1}
					onDelete={() => data.splice(item.index, 1)}
					status={item.status}
				/>
			{/if}
		{/each}
	</details>
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
