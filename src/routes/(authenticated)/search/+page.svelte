<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { InlineNotification } from 'carbon-components-svelte';

	import { pb } from '$lib/pocketbase';

	let form = $state(/** @type {HTMLFormElement | null} */);
	let results = $state();

	function searchObject(obj, searchTerm) {
		const results = [];
		const term = searchTerm.toLowerCase();

		console.log(results, term);

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
						if (value.toLowerCase().includes(term)) {
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

		const filter = Object.entries({ title, data, notes })
			.filter(([_, v]) => v)
			.map(([f]) => `${f} ~ {:q}`)
			.join(' || ');

		results = await pb.collection('images').getList(1, 20, {
			filter: pb.filter(filter, { q })
		});

		const url = new URL(page.url);
		url.searchParams.set('q', q);
		window.history.replaceState(null, '', url);
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
		<label><input type="checkbox" name="title" checked /> Title </label>
		<label><input type="checkbox" name="data" checked /> Fields</label>
		<label><input type="checkbox" name="notes" checked /> Notes</label>
	</div>
</form>

{#if results?.items.length}
	<section id="results">
		{#each results.items as result, i (/** @type {string} */ result.id)}
			<!-- <pre>{JSON.stringify(result, null, 2)}</pre> -->
			<div>
				<a href={resolve('/image?imageId=' + result.id)}>{result.title}</a>
				<pre>{JSON.stringify(searchObject(result, form.q.value), null, 2)}</pre>
			</div>
		{/each}
	</section>
{:else}
	<InlineNotification kind="info" title="No Results" />
{/if}

<style>
	section {
		overflow: auto;
	}
</style>
