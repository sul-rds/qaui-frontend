import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

/**
 * @typedef {Partial<import('tippy.js').Props> & { enabled?: boolean }} TooltipParams
 */

/**
 * Generates a tooltip for the given node with optional parameters.
 *
 * @param {HTMLElement | SVGElement} node
 * @param {TooltipParams} [params]
 * @returns {{ update: (newParams: TooltipParams) => void, destroy: () => void }}
 */
function tooltip(node, params = /** @type {TooltipParams} */ ({})) {
	const { enabled, ...tippyParams } = params;

	/** @type {import('tippy.js').Instance | null} */
	let tip = null;

	/** @param {Partial<import('tippy.js').Props>} tippyParams */
	const setup = (tippyParams) => {
		// Prefer custom content, then HTML title attribute then the aria-label in that order.
		let content = params?.content || (node instanceof HTMLElement ? node.title : null);
		const label = node.getAttribute('aria-label');
		content = content ?? label;

		// Set the"aria-label" attribute if required
		// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute
		if (!label && content) node.setAttribute('aria-label', /** @type {string} */ (content));

		// Clear out the HTML title attribute
		if (node instanceof HTMLElement) node.title = '';

		// Support Tippy props by forwarding params
		// https://atomiks.github.io/tippyjs/v6/all-props/
		tip = tippy(node, { content: content ?? undefined, ...tippyParams });
	};

	const destroy = () => {
		if (tip) {
			tip.destroy();
			tip = null;
		}
	};

	if (enabled !== false) {
		setup(tippyParams);
	}

	return {
		// Update the Tippy instance when props change
		/** @param {TooltipParams} newParams */
		update: (newParams) => {
			const { enabled, ...tippyParams } = newParams;
			if (enabled !== false) {
				destroy();
				setup(tippyParams);
			} else {
				destroy();
			}
		},

		// Clean up the Tippy instance on unmount:
		destroy
	};
}

export { tooltip };
