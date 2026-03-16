<script>
	import { Button } from 'carbon-components-svelte';

	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import Subtract from 'carbon-icons-svelte/lib/Subtract.svelte';

	import Field from '$components/Field.svelte';
	import Fields from '$components/Fields.svelte';

	/** @typedef {import('json-schema').JSONSchema7} JSONSchema7 */

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {{ [key: string]: any }} data
	 * @prop {{ [key: string]: any }} originalData
	 * @prop {JSONSchema7} schema
	 */

	/** @type {FieldsProps} */
	let { data = $bindable(), originalData, schema } = $props();

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
</script>

{#if data}
	{#each orderedKeys as key (key)}
		{#if typeof data[key] === 'object' && data[key] !== null}
			<details open>
				<summary>
					<div class="overlay">
						<Button size="small" kind="ghost" iconDescription="Expand All" icon={Add} />
						<Button size="small" kind="ghost" iconDescription="Collapse All" icon={Subtract} />
					</div>
					{key}
				</summary>
				<Fields
					bind:data={data[key]}
					originalData={originalData[key]}
					schema={Array.isArray(data) ? schema.items : schema.properties?.[key]}
				/>
			</details>
		{:else}
			<Field {key} bind:value={data[key]} originalValue={originalData?.[key]} {schema} />
		{/if}
	{/each}
{/if}

<style>
	.overlay {
		position: absolute;
		right: 0;
		top: 0;
		/* background-color: rgba(0, 0, 0, 0.1); */
		color: white;
		padding: 0.5rem;
		height: 100%;
		display: flex;
		align-items: center;
	}

	details {
		padding: 1rem;
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 1);

		& + details {
			border-top: none;
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
