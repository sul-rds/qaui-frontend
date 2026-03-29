<script>
	import Field from '$components/Field.svelte';
	import Fields from '$components/Fields.svelte';
	import FieldInfoAnnotation from '$components/FieldInfoAnnotation.svelte';

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {{ [key: string]: any }} data
	 * @prop {{ [key: string]: any }} originalData
	 * @prop {JSONSchema7} schema
	 * @prop {string} [label]
	 */

	/** @type {FieldsProps} */
	let { data = $bindable(), originalData, schema, label } = $props();

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
	<Field {label} bind:value={data} originalValue={originalData} {schema} />
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
			{#if schema.items?.description}<FieldInfoAnnotation
					description={schema.items?.description}
				/>{/if}
			{label}
		</summary>
		{#each data as item, i (i)}
			<Fields
				bind:data={data[i]}
				originalData={originalData?.[i]}
				schema={schema.items}
				label={i + 1}
			/>
			<!-- onDelete={() => data.splice(i, 1)} -->
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
