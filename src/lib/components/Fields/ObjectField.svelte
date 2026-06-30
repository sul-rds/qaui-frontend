<script>
	import { Button } from 'carbon-components-svelte';

	import { Delete } from '$lib/icons';

	import Fields from '$lib/components/Fields.svelte';
	import FieldInfoAnnotation from '$lib/components/Fields/FieldInfoAnnotation.svelte';

	/**
	 * @typedef {Object} ObjectFieldProps
	 * @prop {string|number} [label]
	 * @prop {JSONSchema7} schema
	 * @prop {{ [key: string]: any }} data
	 * @prop {{ [key: string]: any }} originalData
	 * @prop {DiffStatus} [status]
	 * @prop {Function} [onDelete]
	 */

	/** @type {ObjectFieldProps} */
	let { label, schema, data = $bindable(), originalData, status, onDelete } = $props();

	/** @param {string} key */
	function getObjectSchema(key) {
		return /** @type {JSONSchema7} */ (schema.properties?.[key]);
	}

	/** @type {string[]} */
	const orderedKeys = [];
	for (const key in schema.properties) {
		orderedKeys.push(key);
	}

	// Add any remaining data keys that weren't in the schema schema.properties?.[key]
	for (const key in data) {
		if (!orderedKeys.includes(key)) {
			orderedKeys.push(key);
		}
	}
</script>

{#if label !== undefined}
	<details
		open
		class:modified={status === 'modified'}
		class:removed={status === 'removed'}
		class:added={status === 'added'}
	>
		<summary>
			{#if schema.description}<FieldInfoAnnotation description={schema.description} />{/if}
			{label}
			{#if onDelete}
				<Button
					iconDescription="Delete"
					icon={Delete}
					size="small"
					on:click={() => onDelete()}
					disabled={status === 'removed'}
				/>
			{/if}
		</summary>
		{#each orderedKeys as key (key)}
			{@const objectSchema = getObjectSchema(key)}
			<Fields
				bind:data={data[key]}
				originalData={originalData?.[key]}
				schema={objectSchema}
				label={key}
			/>
		{/each}
	</details>
{:else}
	<!-- top-level object -->
	{#each orderedKeys as key (key)}
		{@const objectSchema = getObjectSchema(key)}
		<Fields
			bind:data={data[key]}
			originalData={originalData?.[key]}
			schema={objectSchema}
			label={key}
		/>
	{/each}
{/if}

<style>
	details {
		padding: 1rem;
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 1);

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
