<script>
	/**
	 * @typedef {import('$lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
	 */
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { Button, InlineNotification, Loading } from 'carbon-components-svelte';
	import ArrowLeft from 'carbon-icons-svelte/lib/ArrowLeft.svelte';
	import ArrowRight from 'carbon-icons-svelte/lib/ArrowRight.svelte';

	import { tooltip } from '$/lib/actions/tooltip';
	import { Approved, Flagged, Modified } from '$lib/icons';
	import {
		getProjectById,
		getImageById,
		getImagesByProjectId,
		updateImageRecord,
		pb
	} from '$lib/pocketbase';
	import { debounce, deepEqual } from '$lib/utils';

	import QaInterface from '$components/QaInterface.svelte';

	let image = $state();
	let project = $state();
	let loading = $state(true);
	let saving = $state(false);
	let error = $state();
	let nextImage = $state();
	let previousImage = $state();

	async function loadData(/** @type {string} */ imageId) {
		loading = true;
		error = null;
		try {
			image = await getImageById(imageId);
			project = await getProjectById(image.project);
		} catch (e) {
			error = e;
		} finally {
			loading = false;
			const projectImages = await getImagesByProjectId(image.project);
			const currentIndex = projectImages.findIndex((i) => i.id === image.id);
			previousImage = projectImages[currentIndex - 1];
			nextImage = projectImages[currentIndex + 1];
		}
	}

	let initialized = false;
	// eslint-disable-next-line svelte/prefer-writable-derived
	let data = $state({});

	const debouncedSaveData = debounce(() => {
		console.log('Saving...');
		image.modified = !deepEqual($state.snapshot(data), $state.snapshot(image.original_data));
		updateImageRecord(image.id, {
			data: $state.snapshot(data),
			modified: image.modified
		}).then(() => (saving = false));
	}, 500);

	const debouncedSaveNotes = debounce((notes) => {
		console.log('Saving Notes...');
		updateImageRecord(image.id, { notes }).then(() => (saving = false));
	}, 500);

	const toggleApproved = () => {
		image.approved = !image.approved;

		if (image.approved) {
			updateImageRecord(image.id, {
				approved: image.approved,
				approved_by: pb.authStore.record?.id
			});
		} else {
			updateImageRecord(image.id, { approved: image.approved, approved_by: '' });
		}
	};

	const toggleFlagged = () => {
		image.flagged = !image.flagged;
		updateImageRecord(image.id, { flagged: image.flagged });
	};

	$effect(() => {
		data = structuredClone($state.snapshot(image?.data));
	});

	$effect(() => {
		JSON.stringify(data);
		if (!data) return;
		if (!initialized) {
			initialized = true;
			return;
		}
		saving = true;
		debouncedSaveData();
		return () => debouncedSaveData.cancel();
	});

	$effect(() => {
		if (!image) return;
		saving = true;
		debouncedSaveNotes(image.notes);
		return () => debouncedSaveNotes.cancel();
	});

	const breadcrumbs = getContext('breadcrumbs');
	$effect(() => {
		Promise.all([project, image]).then(([_project, _image]) =>
			breadcrumbs.set([
				{ name: _project?.name, link: `/project?projectId=${_project?.id}` },
				{ name: _image?.title, link: `/image?imageId=${_image?.id}` }
			])
		);
		return () => breadcrumbs.set();
	});

	loadData(page.url.searchParams.get('imageId') || '');
</script>

<svelte:head>
	{#if image && project}
		<title>{image?.title}</title>
	{:else}
		<title>Invalid Image ID</title>
	{/if}
	<meta name="description" content="" />
</svelte:head>

{#if loading}
	<p>Loading...</p>
{:else if error}
	<InlineNotification lowContrast hideCloseButton kind="error" title="Invalid Image ID">
		<span slot="subtitleChildren">
			Image "<span style="font-family:monospace">{page.url.searchParams.get('imageId')}</span>"
			could not be loaded.
		</span>
	</InlineNotification>
{:else if image && project}
	<div class="toolbar">
		<Button
			size="small"
			kind="ghost"
			iconDescription="Previous Image"
			icon={ArrowLeft}
			disabled={!previousImage}
			href="image?imageId={previousImage?.id}"
			onclick={() => loadData(previousImage.id)}
		/>
		<div class="toolbar-center">
			<div class:hidden={!saving}><Loading withOverlay={false} small /></div>
			{#await image then image}<h3>{image?.title}</h3>{/await}
			<div class="status-icons">
				<span class:hidden={!image.flagged} use:tooltip={{ content: 'Flagged' }}><Flagged /></span>
				<span class:hidden={!image.modified} use:tooltip={{ content: 'Modified' }}
					><Modified /></span
				>
				<span class:hidden={!image.approved} use:tooltip={{ content: 'Approved' }}
					><Approved /></span
				>
			</div>
		</div>
		<Button
			size="small"
			kind="ghost"
			iconDescription="Next Image"
			icon={ArrowRight}
			disabled={!nextImage}
			href="image?imageId={nextImage?.id}"
			onclick={() => loadData(nextImage.id)}
		/>
	</div>
	<QaInterface
		bind:image
		bind:data
		originalData={image.original_data}
		schema={project.schema}
		{toggleApproved}
		{toggleFlagged}
	/>
{/if}

<style>
	.toolbar {
		align-items: center;
		background-color: var(--primary);
		color: white;
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		margin-top: -1rem;
		padding: 0.25rem 1rem;

		::selection {
			background-color: white;
			color: var(--primary);
		}

		:global(.bx--btn--ghost path) {
			fill: white;
		}

		:global(.bx--btn--ghost:not([disabled]):hover path) {
			fill: var(--primary);
		}

		.toolbar-center {
			align-items: center;
			display: flex;
			gap: 1rem;
		}

		.status-icons {
			display: flex;
			gap: 0.5rem;
		}

		.hidden {
			visibility: hidden;
		}
	}

	p {
		padding-left: 1rem;
	}

	h3 {
		font-size: 1.5rem;
		margin: 0;
	}
</style>
