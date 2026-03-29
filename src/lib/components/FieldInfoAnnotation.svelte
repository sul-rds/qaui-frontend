<script>
	import Information from 'carbon-icons-svelte/lib/Information.svelte';
	import { tooltip } from '$lib/actions/tooltip';

	/**
	 * @typedef {Object} FieldsProps
	 * @prop {string} [description]
	 */

	/** @type {FieldsProps} */
	let { description } = $props();
</script>

{#if description}
	<span class="i" use:tooltip={{ content: description }}><Information /></span>
{:else}
	<span class="i"></span>
{/if}

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
</style>
