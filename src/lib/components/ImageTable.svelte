<script>
	import { resolve } from '$app/paths';
	import { ImageLoader } from 'carbon-components-svelte';
	import { DataTable, Pagination } from 'carbon-components-svelte';

	import { Approved, Modified, Flagged } from '$lib/icons';

	/**
	 * @typedef {Object} ImageGridProps
	 * @prop {ImageWithApprovedBy[]} images
	 */

	/** @type {ImageGridProps} */
	let { images } = $props();

	let page = $state(1);
	let pageSize = $state(10);

	const headers = [
		{ key: 'image', value: 'Image', empty: false },
		{ key: 'title', value: 'Title', empty: false },
		{ key: 'data_source', value: 'Data Source', empty: false },
		{ key: 'approved_by', value: 'Approved By', empty: false },
		{
			key: 'approved',
			value: 'Approved',
			empty: false,
			sort: (/** @type {Boolean} */ a, /** @type {Boolean} */ b) => +b - +a
		},
		{
			key: 'modified',
			value: 'Modified',
			empty: false,
			sort: (/** @type {Boolean} */ a, /** @type {Boolean} */ b) => +b - +a
		},
		{
			key: 'flagged',
			value: 'Flagged',
			empty: false,
			sort: (/** @type {Boolean} */ a, /** @type {Boolean} */ b) => +b - +a
		}
	];

	console.log(images);
</script>

<section>
	<Pagination bind:pageSize bind:page totalItems={images.length} pageSizeInputDisabled />
	<DataTable
		class="images-table"
		{headers}
		rows={images}
		{pageSize}
		{page}
		sortable
		zebra
		stickyHeader
	>
		<svelte:fragment slot="cell-header" let:header>
			{#if header.key === 'modified'}
				<Modified />
			{:else if header.key === 'approved'}
				<Approved />
			{:else if header.key === 'flagged'}
				<Flagged />
			{:else}
				{header.value}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="cell" let:row let:cell>
			{#if cell.key === 'title'}
				<a href="{resolve('/image')}?imageId={row.id}">{row.title}</a>
			{:else if cell.key === 'image'}
				<ImageLoader fadeIn src={row.image_url} alt={row.title} />
			{:else if cell.key === 'approved_by'}
				{row.approved_by ? row.expand.approved_by.name : ''}
			{:else if cell.key === 'modified'}
				{#if cell.value}
					<Modified />
				{/if}
			{:else if cell.key === 'approved'}
				{#if cell.value}
					<Approved />
				{/if}
			{:else if cell.key === 'flagged'}
				{#if cell.value}
					<Flagged />
				{/if}
			{:else}
				{cell.value}
			{/if}
		</svelte:fragment>
	</DataTable>
	<Pagination bind:pageSize bind:page totalItems={images.length} pageSizeInputDisabled />
</section>

<style>
	:root {
		--cell-padding: 0.5rem;
		--row-height: 80px;
	}

	section {
		margin: 0 auto;
		width: 100%;
	}

	:global(.images-table) {
		max-height: 100%;
		min-height: 0;
	}

	:global(.images-table .bx--data-table_inner-container) {
		height: 100%;
	}

	:global(.images-table table) {
		height: 100%;
		max-height: fit-content;
	}

	:global(.images-table tbody) {
		height: calc(100% - 50px);
	}

	:global(.images-table tr > :is(:nth-child(1))) {
		width: calc((100% - 350px - 3 * 60px) / 2);
	}

	:global(.images-table tr > :is(:nth-child(2))) {
		width: calc((100% - 350px - 3 * 60px) / 2);
	}

	:global(.images-table tr > :is(:nth-child(3))) {
		width: 200px;
	}

	:global(.images-table tr > :is(:nth-child(4))) {
		width: 150px;
	}

	:global(.images-table tr > :is(:nth-child(5), :nth-child(6), :nth-child(7))) {
		width: 60px;

		&:not(:has(button)) {
			padding-left: 0.5rem;
		}

		:global(.bx--table-sort) {
			padding-left: 0.5rem;
		}
	}

	:global(.images-table td) {
		position: relative;
		height: var(--row-height);
	}

	:global(.images-table img) {
		clip-path: inset(0 0 calc(100% - var(--row-height) + 2 * var(--cell-padding)) 0);
		left: var(--cell-padding);
		position: absolute;
		top: var(--cell-padding);
		transform-origin: 0% 10%;
		transition:
			clip-path 0.5s ease,
			object-position 1000ms ease-out,
			transform 200ms ease-out;
		width: calc(100% - 2 * var(--cell-padding));

		&:hover {
			box-shadow: 0 0 4px 2px #000f;
			clip-path: inset(0 0 calc(100% - 250px) 0);
			transform: translate(-20px) scale(150%);
			transition:
				clip-path 0.5s ease,
				object-position 8000ms ease-in,
				transform 400ms ease-in;
			z-index: 1;
		}
	}
</style>
