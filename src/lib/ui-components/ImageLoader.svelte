<script>
	/**
	 * @typedef {Object} ImageLoaderProps
	 * @prop {string} src
	 * @prop {string} alt
	 * @prop {string} [size]
	 * @prop {boolean} [fadeIn]
	 * @prop {string} [class]
	 * @prop {Function} [onload]
	 * @prop {Function} [onerror]
	 * @prop {import('svelte').Snippet} [loading]
	 * @prop {import('svelte').Snippet} [error]
	 */

	/** @type {ImageLoaderProps} */
	let {
		src,
		alt,
		size = '2rem',
		fadeIn = true,
		class: className = '',
		onload,
		onerror,
		loading,
		error: errorSnippet,
		...restProps
	} = $props();

	let loaded = $state(false);
	let hasError = $state(false);

	$effect(() => {
		src;
		loaded = false;
		hasError = false;
	});

	const handleLoad = (/** @type {Event} */ event) => {
		loaded = true;
		onload?.(event);
	};

	const handleError = (/** @type {Event} */ event) => {
		hasError = true;
		onerror?.(event);
	};
</script>

<div class="image-loader {className}" {...restProps}>
	{#if !loaded && !hasError}
		<div class="overlay">
			{#if loading}
				{@render loading()}
			{:else}
				<svg
					class="spinner"
					style="width: {size}; height: {size};"
					viewBox="0 0 100 100"
					aria-label="Loading image"
					role="status"
				>
					<circle class="track" cx="50" cy="50" r="44" />
					<circle class="arc" cx="50" cy="50" r="44" />
				</svg>
			{/if}
		</div>
	{/if}

	{#if hasError}
		<div class="overlay error">
			{#if errorSnippet}
				{@render errorSnippet()}
			{:else}
				<span class="error-text">Unable to load image</span>
			{/if}
		</div>
	{:else}
		<img
			{src}
			{alt}
			class="img"
			class:fade={fadeIn}
			class:loaded
			onload={handleLoad}
			onerror={handleError}
		/>
	{/if}
</div>

<style>
	.image-loader {
		display: inline-block;
		height: 100%;
		overflow: hidden;
		position: relative;
		width: 100%;
	}

	.img {
		display: block;
		height: 100%;
		object-fit: cover;
		width: 100%;
	}

	.fade {
		opacity: 0;
		transition: opacity 300ms cubic-bezier(0.2, 0, 0.38, 0.9);

		&.loaded {
			opacity: 1;
		}
	}

	.overlay {
		align-items: center;
		display: flex;
		inset: 0;
		justify-content: center;
		position: absolute;

		&.error {
			background-color: #fff1f1;
		}

		.error-text {
			font-size: 0.75rem;
			color: #da1e28;
		}
	}

	.spinner {
		width: 2rem;
		height: 2rem;
		animation: image-loader-spin 0.7s linear infinite;
		transform-origin: center;

		.track {
			fill: none;
			stroke: rgba(0, 0, 0, 0.1);
			stroke-width: 8;
		}

		.arc {
			fill: none;
			stroke: var(--primary, #0f62fe);
			stroke-width: 8;
			stroke-linecap: round;
			/* circumference = 2 * PI * r(44) ≈ 276.5; ~1/4 of it is the visible arc */
			stroke-dasharray: 276.5;
			stroke-dashoffset: 207;
		}
	}

	@keyframes image-loader-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
