<script>
	import { onMount, tick } from 'svelte';

	// import SearchInput from '$components/SearchInput.svelte';

	/**
	 * @typedef {Object} Field
	 * @prop {string} key
	 * @prop {string} [label]
	 * @prop {number|string} accessor - Accessor (object key or array index) for the field.
	 * @prop {boolean} [sortable]
	 * @prop {"asc" | "desc"} [defaultSortDirection]
	 * @prop {(value: any) => string} [format]
	 * @prop {import('svelte').Snippet<[{ field: Field }]>} [headerRender]
	 * @prop {import('svelte').Snippet<[{ value: any, item: Item, field: Field }]>} [cellRender]
	 * @prop {string} [width] - Explicit CSS grid track size (e.g. "120px", "2fr", "minmax(80px, 1fr)")
	 */

	/**
	 * @typedef {{[key: string]: number | string}} Item
	 */

	/**
	 * @typedef {Object} TableProps
	 * @prop {Item[]} data
	 * @prop {Field[]} fields
	 * @prop {string|number} keyAccessor - Accessor (object key or array index) for the primary key.
	 * @prop {(event: MouseEvent, item: Item) => any} [onRowClick]
	 * @prop {string} [id]
	 * @prop {string} [class]
	 * @prop {string} [label]
	 * @prop {number|null} [pageSize]
	 */

	/** @type {TableProps} */
	let { data, fields, keyAccessor, onRowClick, label, pageSize = null, ...props } = $props();

	let loading = $state(true);
	let tbody = $state();
	let scrollbarOffset = $state(0);
	let sortOrder = $state();
	let items = $derived.by(() => {
		let result = [...data];
		if (sortOrder) {
			const parts = sortOrder.split('-');
			const direction = parts.pop();
			const key = parts.join('-');
			const field = fields.find((field) => field.key === key);
			if (field) {
				const asc = direction === 'asc';
				result.sort((a, b) => {
					if (a[field.accessor] < b[field.accessor]) return asc ? -1 : 1;
					if (a[field.accessor] > b[field.accessor]) return asc ? 1 : -1;
					return 0;
				});
			}
		}
		return result;
	});
	let pagedItems = $state(/** @type {Item[]} */ ([]));
	let currentPage = $state(1);
	let thead = $state();
	let columnWidths = $state(/** @type {Record<number, number>} */ ({}));
	let gridTemplate = $state('');
	let resizeTimer = $state(/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined));

	/** @param {Field} field */
	const sortItems = async (field) => {
		loading = true;
		await tick();

		const { key } = field;
		if (sortOrder?.startsWith(key)) {
			// Toggle sort direction
			sortOrder = sortOrder === `${key}-asc` ? `${key}-desc` : `${key}-asc`;
		} else {
			sortOrder = `${key}-${field.defaultSortDirection || 'asc'}`;
		}
		currentPage = 1;
	};

	/** Estimates the pixel width of a CSS grid track sizing function for layout math */
	const estimateExplicitWidth = (/** @type {string|undefined} */ width) => {
		if (!width) return 0;
		const pxMatch = width.match(/^(\d+(?:\.\d+)?)px$/);
		if (pxMatch) return parseFloat(pxMatch[1]);
		const remMatch = width.match(/^(\d+(?:\.\d+)?)rem$/);
		if (remMatch) {
			const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
			return parseFloat(remMatch[1]) * rootFontSize;
		}
		const minmaxMatch = width.match(/^minmax\((\d+(?:\.\d+)?)px,\s*.*\)$/);
		if (minmaxMatch) return parseFloat(minmaxMatch[1]);
		const minmaxRemMatch = width.match(/^minmax\((\d+(?:\.\d+)?)rem,\s*.*\)$/);
		if (minmaxRemMatch) {
			const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
			return parseFloat(minmaxRemMatch[1]) * rootFontSize;
		}
		return 0;
	};

	/** Builds grid-template-columns from explicit widths and measured fallbacks */
	const buildGridTemplate = () => {
		return fields
			.map((field, i) => {
				if (field.width) return field.width;
				if (columnWidths[i] != null) return `${columnWidths[i]}px`;
				return '1fr';
			})
			.join(' ');
	};

	/** Measures content width of each column and updates grid template */
	const measureColumns = () => {
		if (!thead || !tbody || fields.length === 0) return;

		requestAnimationFrame(() => {
			thead.style.gridTemplateColumns = 'repeat(var(--n-columns), max-content)';
			tbody.style.gridTemplateColumns = 'repeat(var(--n-columns), max-content)';

			const widths = /** @type {Record<number, number>} */ ({});
			const headerRow = thead.querySelector('tr:first-of-type');

			for (let i = 0; i < fields.length; i++) {
				if (fields[i].width) continue;

				let max = 0;
				if (headerRow) {
					const th = headerRow.children[i];
					if (th) max = Math.max(max, th.offsetWidth);
				}

				const bodyCells = tbody.querySelectorAll(`td:nth-child(${i + 1})`);
				bodyCells.forEach((/** @type {HTMLElement} */ cell) => {
					max = Math.max(max, cell.offsetWidth);
				});

				widths[i] = max;
			}

			const containerWidth = tbody.clientWidth;
			const totalMeasured = Object.values(widths).reduce((sum, w) => sum + w, 0);
			const totalExplicit = fields.reduce((sum, f) => sum + estimateExplicitWidth(f.width), 0);
			const autoCount = fields.filter((f) => !f.width).length;
			const availableWidth = containerWidth - totalExplicit;

			if (autoCount > 0 && totalMeasured !== availableWidth) {
				const scale = Math.max(0, availableWidth) / totalMeasured;
				Object.keys(widths).forEach((k) => {
					widths[Number(k)] = Math.round(widths[Number(k)] * scale);
				});
			}

			columnWidths = widths;
			gridTemplate = buildGridTemplate();
			thead.style.gridTemplateColumns = gridTemplate;
			tbody.style.gridTemplateColumns = gridTemplate;
		});
	};

	$effect(() => {
		if (!tbody) return;
		const resizeObserver = new ResizeObserver(() => {
			scrollbarOffset =
				/** @type {HTMLTableSectionElement} */ (tbody).offsetWidth - tbody.scrollWidth;
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(measureColumns, 100);
		});
		resizeObserver.observe(tbody);
		return () => {
			resizeObserver.disconnect();
			clearTimeout(resizeTimer);
		};
	});

	$effect(() => {
		const page = currentPage;
		pagedItems =
			pageSize !== null
				? items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
				: items;
		loading = false;
	});

	onMount(() => {
		tick().then(measureColumns);
	});
</script>

<table
	aria-label={label ?? 'Data table'}
	aria-rowcount={items.length}
	style:--n-columns={fields.length}
	style:--scrollbar-offset={scrollbarOffset + 'px'}
	{...props}
>
	<thead bind:this={thead}>
		<tr>
			{#each fields as field, i (i)}
				{#if field.sortable}
					<th
						scope="col"
						class={field.key}
						aria-sort={(sortOrder === `${field.key}-asc` && 'ascending') ||
							(sortOrder === `${field.key}-desc` && 'descending') ||
							null}
					>
						<button onclick={() => sortItems(field)}>
							{#if field.headerRender}
								{@render field.headerRender({ field })}
							{:else}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html field.label}
							{/if}
						</button>
					</th>
				{:else if field.headerRender}
					<th scope="col">{@render field.headerRender({ field })}</th>
				{:else if field.label}
					<th scope="col">{field.label}</th>
				{:else}
					<td></td>
				{/if}
			{/each}
		</tr>
	</thead>

	<tbody
		bind:this={tbody}
		class:loading
		onscroll={(event) => {
			thead.style.translate = `-${/** @type {HTMLElement} */ (event.target)?.scrollLeft}px 0`;
		}}
	>
		{#each pagedItems as item (item[keyAccessor])}
			<tr onclick={(event) => onRowClick?.(event, item)}>
				{#each fields as field, i (i)}
					<td class={field.key}>
						{#if field.cellRender}
							{@render field.cellRender({
								value: item[field.accessor],
								item,
								field
							})}
						{:else}
							{@const formattedValue = field.format
								? field.format(item[field.accessor])
								: item[field.accessor]}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html formattedValue}
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
{#if pageSize !== null}
	<div class="pagination">
		{#if items.length === 0}
			No results
		{:else}
			{@const pageStart = pageSize * (currentPage - 1) + 1}
			<span aria-live="assertive">
				Showing <strong>{pageStart}</strong>&nbsp;to&nbsp;<strong>
					{Math.min(pageStart + pageSize - 1, items.length)}
				</strong>&nbsp;of&nbsp;<strong>{items.length.toLocaleString()}</strong>
			</span>

			<button disabled={currentPage === 1} onclick={() => (currentPage -= 1)}>
				&laquo; Previous
			</button>
			<button disabled={currentPage * pageSize >= items.length} onclick={() => (currentPage += 1)}>
				Next &raquo;
			</button>
		{/if}
	</div>
{/if}

<style>
	.controls {
		display: flex;
		gap: 1rem;
		justify-content: flex-start;
		padding-left: 2px;
		margin-bottom: 0.5rem;
	}

	table {
		--n-columns: 2;
		--row-height: 35px;
		--scrollbar-offset: 0px;

		display: contents;
		border-collapse: collapse;
	}

	thead,
	tbody {
		box-sizing: border-box;
		display: grid;
		width: 100%;
		grid-template-columns: var(--grid-template, repeat(var(--n-columns), 1fr));
		flex: 0 1 auto;
	}

	thead {
		padding-right: var(--scrollbar-offset);
		z-index: 1;
	}

	tbody {
		overflow-y: auto;
		position: relative;
	}

	tr {
		display: contents;
	}

	thead th {
		padding-right: 1rem;
		position: relative;
		text-align: left;

		button {
			appearance: none;
			background-color: transparent;
			border: none;
			color: inherit;
			cursor: pointer;
			font: inherit;
			height: 100%;
			left: 0;
			overflow: hidden;
			padding: inherit;
			position: absolute;
			text-align: inherit;
			text-overflow: ellipsis;
			top: 0;
			white-space: nowrap;
			width: 100%;

			&:before,
			&:after {
				border: 6px solid transparent;
				position: absolute;
				display: block;
				content: '';
				height: 0;
				right: 0.5rem;
				top: 50%;
				width: 0;
			}
		}

		&:not([aria-sort]) button:before,
		&[aria-sort='ascending'] button:before {
			border-bottom-color: currentColor;
			margin-top: -14px;
		}

		&:not([aria-sort]) button:after,
		&[aria-sort='descending'] button:after {
			border-top-color: currentColor;
			margin-top: 3px;
		}
	}

	th {
		padding: 0 0.5rem;
		height: var(--row-height);
		line-height: var(--row-height);
	}

	.pagination {
		align-items: center;
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		padding: 0 0.5rem;

		span {
			flex-grow: 1;
		}
	}
</style>
