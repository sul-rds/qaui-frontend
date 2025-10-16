<script>
	import { Button } from 'carbon-components-svelte';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import Subtract from 'carbon-icons-svelte/lib/Subtract.svelte';

	import Fields from '$components/Fields.svelte';

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {Object} data
	 */

	/** @type {FieldsProps} */
	let { data } = $props();
</script>

{#if data}
	{#each Object.entries(data) as [key, value]}
		{#if typeof value === 'object' && value !== null}
			<details open>
				<summary>
					<div class="overlay">
						<Button size="small" kind="ghost" iconDescription="Expand All" icon={Add} />
						<Button size="small" kind="ghost" iconDescription="Collapse All" icon={Subtract} />
					</div>
					{key}
				</summary>
				<Fields data={value} />
			</details>
		{:else}
			<p>{key}: {value}</p>
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
