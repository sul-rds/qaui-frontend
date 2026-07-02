<script>
	import { goto, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import { pb } from '$lib/pocketbase';
	import { tooltip } from '$/lib/actions/tooltip';
	import { LinkOut } from '$lib/icons';

	let form = $state(/** @type {HTMLFormElement | null} */);
	let results = $state();

	async function executeSearch(query, searchFields) {
		if (!query) return;

		const filter = Object.entries(searchFields)
			.filter(([_, v]) => v)
			.map(([f]) => `${f} ~ {:q}`)
			.join(' || ');

		results = await pb.collection('images').getList(1, 20, {
			filter: pb.filter(filter, { q: query })
		});
	}

	$effect(() => {
		form.q.value = page.url.searchParams.get('q');
		if (form.q.value) {
			executeSearch(form.q.value, { title: true, data: true, notes: true });
		}
	});

	function searchObject(obj, searchTerm) {
		const results = [];
		const term = searchTerm.toLowerCase();

		const walk = (current, path) => {
			if (current === null || current === undefined) return;

			if (Array.isArray(current)) {
				current.forEach((item, index) => {
					walk(item, [...path, index]);
				});
				return;
			}

			if (typeof current === 'object') {
				for (const [key, value] of Object.entries(current)) {
					const newPath = [...path, key];

					if (value !== null && typeof value === 'object') {
						// Recurse into nested objects/arrays
						walk(value, newPath);
					} else {
						if (String(value).toLowerCase().includes(term)) {
							results.push({
								path: newPath.join('.'),
								key,
								value
							});
						}
					}
				}
				return;
			}
		};

		walk(obj, []);
		return results;
	}

	const search = async (/** @type {SubmitEvent} */ evt) => {
		evt.preventDefault();

		const formData = new FormData(form);
		const { q, title, data, notes } = Object.fromEntries(formData.entries());

		if (!q) return;
		if (!title && !data && !notes) return;

		const url = new URL(page.url);
		url.searchParams.set('q', q);
		replaceState(resolve(`/search?${url.searchParams.toString()}`), page.state);

		await executeSearch(q, { title, data, notes });
	};

	const markupValue = (value, searchTerm) => {
		return value
			.toString()
			.replace(new RegExp(searchTerm, 'gi'), (match) => `<mark>${match}</mark>`);
	};
</script>

<svelte:head>
	<title>Search</title>
	<meta name="description" content="" />
</svelte:head>

<form method="GET" onreset={() => goto(resolve('/search'))} onsubmit={search} bind:this={form}>
	<div>
		<input name="q" type="search" />
		<button type="submit" class="button">Search</button>
		<button type="reset" class="button">Clear</button>
	</div>
	<div class="search-types">
		<strong>Search:</strong>
		<label><input type="checkbox" name="title" disabled /> Title </label>
		<label><input type="checkbox" name="data" checked /> Fields</label>
		<label><input type="checkbox" name="notes" disabled /> Notes</label>
	</div>
</form>

{#if results?.items.length}
	<section id="results">
		{#each results.items as result, i (/** @type {string} */ result.id)}
			{@const matches = searchObject(result.data, form.q.value)}
			<section class="result">
				<div class="match-details">
					<h3>
						<a href={resolve('/image?imageId=' + result.id)} target="_blank"
							>{result.title} <LinkOut /></a
						>
					</h3>
					{#each matches as match (match.path)}
						{@const path = match.path.split('.').slice(0, -1).join(' > ')}
						{@const status = ''}
						{@const markedUpValue = markupValue(match.value, form.q.value)}
						<span class="path">{path}</span>
						<div class="field">
							<span class="label">{match.key}:</span>
							<span
								class="value"
								class:modified={status === 'modified'}
								class:removed={status === 'removed'}
								class:added={status === 'added'}
								use:tooltip={{
									content: `Original value: '[empty]'`,
									placement: 'top-start',
									enabled: status === 'modified'
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
		margin-left: 1rem;
		margin-top: 0.5rem;
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
