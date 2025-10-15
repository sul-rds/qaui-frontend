<script>
	import { ClickableTile } from 'carbon-components-svelte';
	import ArrowRight from 'carbon-icons-svelte/lib/ArrowRight.svelte';

	import { pb } from '$lib/pocketbase';

	/**
	 * @typedef {Object} ProjectsProps
	 */

	/** @type {ProjectsProps} */
	let {} = $props();

	const projects = pb.collection('projects').getFullList();
</script>

{#await projects then projects}
	<section>
		{#each projects as project}
			<ClickableTile light href="project/?projectId={project.id}">
				<h3>{project.name} <ArrowRight size={32} /></h3>
				<p>{project.description}</p>
				{#if project.link}<a href={project.link}>Link</a>{/if}
			</ClickableTile>
		{/each}
	</section>
{/await}

<style>
	section {
		margin: 1rem 0;
		max-width: 800px;

		h3 {
			align-items: center;
			display: flex;
			font-weight: bold;
			justify-content: space-between;
		}
	}
</style>
