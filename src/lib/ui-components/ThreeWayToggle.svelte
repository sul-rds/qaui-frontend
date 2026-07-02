<script>
	/**
	 * @typedef {{ value: string|boolean, label: string, color: string }} ToggleOption
	 */

	/**
	 * @typedef {Object} ThreeWayToggleProps
	 * @prop {string|boolean} value
	 * @prop {string} name
	 * @prop {ToggleOption[]} options
	 */

	/** @type {ThreeWayToggleProps} */
	let {
		value = $bindable(),
		name,
		options = [
			{ value: false, label: 'False', color: '#e74c3c' },
			{ value: true, label: 'True', color: '#2ecc71' }
		]
	} = $props();

	let activeIndex = $derived(options.findIndex((o) => o.value === value));
	let activeOption = $derived(options[activeIndex]);
</script>

<ul style:--option-count={options.length}>
	{#each options as opt, i (opt.value)}
		<li style="grid-column: {i + 1};" class:active={i === activeIndex}>
			<input type="radio" {name} id="{name}-{opt.value}" value={opt.value} bind:group={value} />
			<label for="{name}-{opt.value}">{opt.label}</label>
		</li>
	{/each}

	{#if activeOption}
		<span style:--active-index={activeIndex} style:background={activeOption.color}> </span>
	{/if}
</ul>

<style>
	ul {
		align-items: stretch;
		border-radius: var(--border-radius, 5px);
		border: 2px solid var(--primary, #777);
		display: grid;
		grid-template-columns: repeat(var(--option-count), 1fr);
		margin: 0;
		padding: 2px;
	}

	li {
		grid-row: 1;

		label {
			align-items: center;
			cursor: pointer;
			display: flex;
			font-size: 15px;
			justify-content: center;
			margin: 0;
			opacity: 0.5;
			padding: 0.125rem 0.5rem 0.25rem;
			position: relative;
			text-align: center;
			transition:
				color 0.3s ease-in-out,
				opacity 0.3s ease-in-out;
			z-index: 2;
		}

		&.active label {
			color: #fff;
			opacity: 1;
		}
	}

	input {
		cursor: pointer;
		margin: 0;
		opacity: 0;
		position: absolute;
		z-index: 3;
	}

	span {
		align-self: stretch;
		border-radius: var(--border-radius, 5px);
		display: block;
		grid-column: 1;
		grid-row: 1;
		transform: translateX(calc(var(--active-index) * 100%));
		transition:
			transform 0.3s ease-in-out,
			background 0.3s ease-in-out;
		z-index: 1;
	}
</style>
