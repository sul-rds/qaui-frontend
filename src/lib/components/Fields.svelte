<script>
	import ArrayField from '$lib/components/Fields/ArrayField.svelte';
	import ObjectField from '$lib/components/Fields/ObjectField.svelte';
	import TextField from '$lib/components/Fields/TextField.svelte';

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {boolean} [top]
	 * @prop {string|number} [label]
	 * @prop {JSONSchema7} schema
	 * @prop {{ [key: string]: any }} data
	 * @prop {{ [key: string]: any }} originalData
	 * @prop {DiffStatus} [status]
	 * @prop {Function} [onDelete]
	 * @prop {Function} [onReset]
	 */

	/** @type {FieldsProps} */
	let {
		top,
		label,
		schema,
		data = $bindable(),
		originalData,
		status,
		onDelete,
		onReset
	} = $props();

	const type = $derived(
		Array.isArray(data)
			? 'array'
			: data !== null && typeof data === 'object'
				? 'object'
				: 'primitive'
	);
</script>

{#if type === 'primitive'}
	<TextField
		{label}
		{schema}
		bind:value={data}
		originalValue={originalData}
		{status}
		{onDelete}
		{onReset}
	/>
{:else if type === 'object'}
	{#if status === 'removed'}
		<!-- this branching is to prevent ownership_invalid_binding -->
		<ObjectField {top} {label} {schema} {data} {originalData} {status} {onReset} />
	{:else}
		<ObjectField {top} {label} {schema} bind:data {originalData} {status} {onDelete} />
	{/if}
{:else if type === 'array'}
	<ArrayField {label} {schema} bind:data {originalData} />
{/if}
