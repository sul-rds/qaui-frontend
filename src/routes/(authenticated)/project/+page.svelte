<script>
	import { getContext } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { InlineNotification } from 'carbon-components-svelte';
	import { Approved, Modified, Flagged } from '$lib/icons';

	import { getProjectById, getImagesByProjectId } from '$lib/pocketbase';

	import Table from '$lib/ui-components/Table.svelte';
	import ThreeWayToggle from '$lib/ui-components/ThreeWayToggle.svelte';

	let showApproved = $state('any');
	let showModified = $state('any');
	let showFlagged = $state('any');

	let project = $state();
	/** @type {Promise<ImageWithApprovedBy[]>|ImageWithApprovedBy[]} */
	let projectImages = $state([]);

	const filterOptions = [
		{ value: 'any', label: 'any', color: 'var(--primary)' },
		{ value: 'true', label: 'yes', color: 'var(--primary)' },
		{ value: 'false', label: 'no', color: 'var(--primary)' }
	];

	const projectId = page.url.searchParams.get('projectId');
	if (projectId) {
		project = getProjectById(projectId);
	}

	const header = getContext('header');
	$effect(() => {
		project?.then((_project) => header.set([_project?.name]));
		return () => header.set();
	});

	$effect(() => {
		if (!projectId) return;
		let filters = Object.entries({
			approved: showApproved,
			modified: showModified,
			flagged: showFlagged
		})
			.map(([k, v]) => (v !== 'any' ? `${k}=${v}` : null))
			.filter(Boolean)
			.join(' && ');
		projectImages = getImagesByProjectId(projectId, filters);
	});

	const fields = [
		{
			key: 'image',
			accessor: 'image_url',
			label: 'Image',
			sortable: false,
			width: 'calc(50% - 265px)',
			cellRender: imageCellRender
		},
		{
			key: 'title',
			accessor: 'title',
			label: 'Title',
			sortable: true,
			width: '1fr',
			cellRender: titleCellRender
		},
		{
			key: 'data_source',
			accessor: 'data_source',
			label: 'Data Source',
			sortable: true,
			width: 'max(200px, 10%)'
		},
		{
			key: 'approved_by',
			label: 'Approved_By',
			accessor: 'approved_by',
			sortable: true,
			width: '150px',
			cellRender: approvedByCellRender
		},
		{
			key: 'approved',
			accessor: 'approved',
			sortable: true,
			defaultSortDirection: 'desc',
			width: '60px',
			headerRender: headerRender,
			cellRender: cellRender
		},
		{
			key: 'modified',
			accessor: 'modified',
			sortable: true,
			defaultSortDirection: 'desc',
			width: '60px',
			headerRender: headerRender,
			cellRender: cellRender
		},
		{
			key: 'flagged',
			accessor: 'flagged',
			sortable: true,
			defaultSortDirection: 'desc',
			width: '60px',
			headerRender: headerRender,
			cellRender: cellRender
		}
	];
</script>

{#snippet headerRender({ value, item, field })}
	{#if field.key === 'approved'}
		<Approved />
	{:else if field.key === 'modified'}
		<Modified />
	{:else if field.key === 'flagged'}
		<Flagged />
	{/if}
{/snippet}

{#snippet cellRender({ value, item, field })}
	{#if field.key === 'approved' && value}
		<Approved />
	{:else if field.key === 'modified' && value}
		<Modified />
	{:else if field.key === 'flagged' && value}
		<Flagged />
	{/if}
{/snippet}

{#snippet imageCellRender({ value, item, field })}
	<img src={item.image_url} alt={item.title} />
{/snippet}

{#snippet titleCellRender({ value, item, field })}
	<a href={resolve('/image') + '?imageId=' + item.id}>{item.title}</a>
{/snippet}

{#snippet approvedByCellRender({ value, item, field })}
	{item.expand.approved_by?.name}
{/snippet}

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
	<header>
		<h3>{project?.name}</h3>

		{#if projectId}
			<div class="filters">
				<label>
					Approved: <ThreeWayToggle
						name="approved"
						bind:value={showApproved}
						options={filterOptions}
					/>
				</label>

				<label>
					Modified: <ThreeWayToggle
						name="modified"
						bind:value={showModified}
						options={filterOptions}
					/>
				</label>

				<label>
					Flagged: <ThreeWayToggle
						name="flagged"
						bind:value={showFlagged}
						options={filterOptions}
					/>
				</label>
			</div>
		{/if}
	</header>

	{#await projectImages then images}
		{#if images.length}
			<section>
				<Table data={images} {fields} keyAccessor="id" id="images-table" pageSize={15} />
			</section>
		{/if}
	{/await}
{:catch}
	<InlineNotification lowContrast hideCloseButton kind="error" title="Invalid Project ID">
		<span slot="subtitleChildren">
			Project "<span style="font-family:monospace">{projectId}</span>" could not be loaded.
		</span>
	</InlineNotification>
{/await}

<style>
	header {
		align-items: start;
		display: flex;
		justify-content: space-between;
	}

	.filters {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-bottom: 1rem;

		label {
			align-items: start;
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}
	}

	section {
		margin: 0 auto;
		width: 100%;
	}

	:global(#images-table) {
		/* override default property set in Table component */
		--row-height: 40px;
	}

	:global(#images-table thead th button) {
		/* sort toggle buttons */
		&:before,
		&:after {
			opacity: 0.5;
		}
	}

	:global(#images-table th) {
		&.approved,
		&.modified,
		&.flagged {
			padding-left: 0.75rem;
		}
	}

	:global(#images-table td) {
		height: var(--row-height);
		overflow: hidden;
		position: relative;
		text-overflow: ellipsis;
		text-wrap: nowrap;

		&.image {
			overflow: hidden;
		}
	}

	:global(#images-table img) {
		width: 100%;
	}
</style>
