<script>
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import { tooltip } from '$/lib/actions/tooltip';
	import { LinkOut } from '$lib/icons';
	import { pb } from '$lib/pocketbase';
	import { debounce, escapeRegExp } from '$lib/utils';

	const params = page.url.searchParams;

	let initial = true;
	let results = $state();
	let searchTerm = $state(params.get('q') ?? '');
	let searchData = $state(true);
	let searchNotes = $state(true);
	let searchTitle = $state(true);

	const debouncedSearch = debounce(async (query, searchFields) => {
		if (!query) return;

		const filter = Object.entries(searchFields)
			.filter(([_, v]) => v)
			.map(([f]) => `${f} ~ {:q}`)
			.join(' || ');

		results = await pb.collection('images').getList(1, 20, {
			filter: pb.filter(filter, { q: query })
		});
	}, 500);

	const searchObject = (obj, searchTerm) => {
		const results = [];
		const term = searchTerm.toLowerCase();

		const walk = (current, path, key) => {
			if (current === null || current === undefined) return;

			if (typeof current === 'object') {
				const entries = Array.isArray(current)
					? current.map((item, index) => [index, item])
					: Object.entries(current);

				for (const [entryKey, value] of entries) {
					walk(value, [...path, entryKey], entryKey);
				}
				return;
			}

			// current is a primitive (string, number, boolean, etc.)
			if (String(current).toLowerCase().includes(term)) {
				results.push({ path: path.join('.'), key, value: current });
			}
		};

		walk(obj, [], null);
		return results;
	};

	const getMatches = (result, searchTerm) => {
		const matches = [];

		if (searchData) {
			matches.push(...searchObject(result.data, searchTerm));
		}

		if (searchNotes) {
			if (String(result.notes).toLowerCase().includes(searchTerm.toLowerCase())) {
				matches.push({ path: 'Notes.', key: null, value: result.notes });
			}
		}
		return matches;
	};

	const getByPath = (obj, path) => {
		const segments = path.split('.');
		let current = obj;

		for (const segment of segments) {
			if (current === null || current === undefined) return undefined;
			const key = Array.isArray(current) ? Number(segment) : segment; // just in case
			current = current[key];
		}

		return current;
	};

	const getStatus = (result, path) => {
		const data = getByPath(result.data, path);
		const originalData = getByPath(result.original_data, path);

		if (data === null || data === undefined) return 'removed';
		if (originalData === null || originalData === undefined) return 'added';
		if (data !== originalData) return 'modified';
		return '';
	};

	const markupValue = (value, searchTerm) => {
		return value
			.toString()
			.replace(new RegExp(escapeRegExp(searchTerm), 'gi'), (match) => `<mark>${match}</mark>`);
	};

	$effect(() => {
		const url = new URL(page.url);

		if (searchTerm) {
			url.searchParams.set('q', searchTerm);
		} else {
			url.searchParams.delete('q');
		}

		if (!initial) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			replaceState(url, { keepFocus: true, noScroll: true });
		}
		initial = false;

		results = undefined;

		if (searchTerm && (searchTitle || searchData || searchNotes)) {
			debouncedSearch(searchTerm, { title: searchTitle, data: searchData, notes: searchNotes });
		}
		return () => debouncedSearch.cancel();
	});
</script>

<svelte:head>
	<title>Search</title>
	<meta name="description" content="" />
</svelte:head>

<section id="search">
	<strong>Search:</strong>
	<div>
		<div>
			<input name="q" type="search" bind:value={searchTerm} />
			{#if searchTerm}<button type="reset" class="button" onclick={() => (searchTerm = '')}
					>Clear</button
				>{/if}
		</div>
		<div class="search-types">
			<label>
				<input type="checkbox" defaultChecked name="title" bind:checked={searchTitle} /> Title
			</label>
			<label>
				<input type="checkbox" defaultChecked name="data" bind:checked={searchData} /> Fields
			</label>
			<label>
				<input type="checkbox" defaultChecked name="notes" bind:checked={searchNotes} /> QA Notes
			</label>
		</div>
	</div>
</section>

{#if results?.items?.length}
	<section id="results">
		<p>
			Total results: {results.totalItems} ({Math.min(results.perPage, results.totalItems)} shown)
		</p>
		{#each results.items as result, i (/** @type {string} */ result.id)}
			{@const matches = getMatches(result, searchTerm)}
			<section class="result">
				<div class="match-details">
					<h3>
						<a href={resolve('/image?imageId=' + result.id)} target="_blank">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html searchTitle ? markupValue(result.title, searchTerm) : result.title}
							<LinkOut />
						</a>
					</h3>
					{#each matches as match (match.path)}
						{@const path = match.path.split('.').slice(0, -1).join(' > ')}
						{@const status = getStatus(result, match.path)}
						{@const markedUpValue = markupValue(match.value, searchTerm)}
						<span class="path">{path}</span>
						<div class="field">
							{#if match.key !== null}
								<span class="label">{match.key}:</span>
							{/if}
							<span
								class="value"
								class:modified={status === 'modified'}
								class:removed={status === 'removed'}
								class:added={status === 'added'}
								use:tooltip={{
									content: `Original Value: ${getByPath(result.original_data, match.path) ?? '[empty]'}`,
									placement: 'top-start',
									enabled: status === 'modified' || status === 'added'
								}}
							>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html markedUpValue}
							</span>
						</div>
					{/each}
				</div>
				<div class="image">
					<img src={result.image_url} alt={result.title} />
				</div>
			</section>
		{/each}
	</section>
{:else if results?.items.length === 0}
	<p>No results</p>
{/if}

<style>
	section#search {
		align-items: baseline;
		display: flex;
		gap: 1rem;
	}

	input[type='search'] {
		appearance: none;
		background-clip: padding-box;
		background-color: #fff;
		border: 1px solid #ced4da;
		border-radius: 0.375rem;
		color: var(--text);
		padding: 0.375rem 0.75rem;
		transition:
			border-color 0.15s ease-in-out,
			box-shadow 0.15s ease-in-out;
	}

	div.search-types {
		margin-top: 0.25rem;
	}

	section#results {
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 1rem 0;

		.result {
			background-color: white;
			border-radius: var(--border-radius);
			border: 2px solid var(--primary);
			display: flex;
			gap: 1rem;
			margin: 0 auto;
			overflow-wrap: anywhere;
			padding: 1rem;
			width: 100%;

			> * {
				width: 50%;
				overflow: hidden;
			}

			.image {
				position: relative;
				overflow: scroll;

				> img {
					position: absolute;
					width: 100%;
				}
			}
		}

		h3 {
			padding-left: 2rem;
			text-indent: -2rem;
			font-size: 1.5rem;
			margin-bottom: 0.5rem;
		}
	}

	span.path {
		color: #777;
		display: block;
		margin-top: 0.75rem;
	}

	div.field {
		align-items: stretch;
		display: flex;
		flex-wrap: wrap;
		font-size: 1rem;
		gap: 0.5rem 0.25rem;
		margin: 0.15rem 0;
		padding: 0.25rem 0;
	}

	span.label {
		display: inline-block;
		line-height: 1.25;
		min-width: 1.5rem;
		text-align: right;
	}

	span.value {
		background-color: #eaeaea;
		flex: 1 1 0px;
		line-height: 1.25;
		margin: -0.25rem 0 -0.25rem 0.5rem;
		min-width: 50%;
		padding: 0.25rem;

		&.modified {
			background-color: hsl(from var(--primary) h s 85%);
			outline: 2px dotted var(--primary);
		}

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
</style>
