<script>
	import { page } from '$app/state';
	import { InlineNotification } from 'carbon-components-svelte';

	import { getProjectById, getImagesByProjectId } from '$lib/pocketbase';

	import ImageTable from '$components/ImageTable.svelte';

	let project = $state();
	/** @type {Promise<ImageWithApprovedBy[]>|ImageWithApprovedBy[]} */
	let projectImages = $state([]);

	const projectId = page.url.searchParams.get('projectId');
	if (projectId) {
		project = getProjectById(projectId);
		projectImages = getImagesByProjectId(projectId);
	}
</script>

<svelte:head>
	{#if !projectId}
		<title>No Project Specified</title>
	{:else}
		{#await project then project}
			<title>{project?.name}</title>
		{:catch}
			<title>Invalid Project ID</title>
		{/await}
	{/if}
	<meta name="description" content="" />
</svelte:head>

{#if !projectId}
	<InlineNotification lowContrast hideCloseButton kind="error" title="No Project specified"
	></InlineNotification>
{/if}

{#await project then project}
	<h3>{project?.name}</h3>
	{#await projectImages then images}
		<ImageTable {images} />
	{/await}
{:catch}
	<InlineNotification lowContrast hideCloseButton kind="error" title="Invalid Project ID">
		<span slot="subtitleChildren">
			Project "<span style="font-family:monospace">{projectId}</span>" could not be loaded.
		</span>
	</InlineNotification>
{/await}

<style>
	:global(.bx--form-item:has(.bx--toggle-input)) {
		flex: 0;
	}
</style>
