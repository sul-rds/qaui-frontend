/**
 * @typedef {Object} PanZoomParams
 * @prop {number} [minScale=0.5] - Minimum zoom level
 * @prop {number} [maxScale=5] - Maximum zoom level
 * @prop {number} [zoomSpeed=0.001] - Zoom sensitivity for wheel events
 */

/**
 * A Svelte action that adds pan and zoom functionality to an element.
 *
 * @param {HTMLElement} node
 * @param {PanZoomParams} [params]
 * @returns {{ update: (newParams: PanZoomParams) => void, destroy: () => void }}
 */
export function panzoom(node, params = {}) {
	let { minScale = 0.5, maxScale = 5, zoomSpeed = 0.001 } = params;

	let scale = 1;
	let translateX = 0;
	let translateY = 0;
	let isPanning = false;
	let startX = 0;
	let startY = 0;

	const applyTransform = () => {
		node.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
		node.style.transformOrigin = '0 0';
	};

	const clampScale = (s) => Math.min(maxScale, Math.max(minScale, s));

	const handleWheel = (/** @type {WheelEvent} */ e) => {
		e.preventDefault();

		const rect = node.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const prevScale = scale;
		scale = clampScale(scale * (1 - e.deltaY * zoomSpeed));

		const ratio = scale / prevScale;
		translateX = mouseX - ratio * (mouseX - translateX);
		translateY = mouseY - ratio * (mouseY - translateY);

		applyTransform();
	};

	const handleMouseDown = (/** @type {MouseEvent} */ e) => {
		if (e.button !== 0) return;
		e.preventDefault();
		isPanning = true;
		startX = e.clientX - translateX;
		startY = e.clientY - translateY;
		node.style.cursor = 'grabbing';
	};

	const handleMouseMove = (/** @type {MouseEvent} */ e) => {
		if (!isPanning) return;
		translateX = e.clientX - startX;
		translateY = e.clientY - startY;
		applyTransform();
	};

	const handleMouseUp = () => {
		isPanning = false;
		node.style.cursor = '';
	};

	const handleDoubleClick = () => {
		scale = 1;
		translateX = 0;
		translateY = 0;
		node.style.transition = 'transform 0.2s ease';
		applyTransform();
		setTimeout(() => (node.style.transition = ''), 200);
	};

	node.addEventListener('wheel', handleWheel, { passive: false });
	node.addEventListener('mousedown', handleMouseDown);
	window.addEventListener('mousemove', handleMouseMove);
	window.addEventListener('mouseup', handleMouseUp);
	node.addEventListener('dblclick', handleDoubleClick);

	node.style.cursor = 'grab';
	node.style.touchAction = 'none';

	return {
		update(newParams) {
			({ minScale, maxScale, zoomSpeed } = newParams);
		},
		destroy() {
			node.removeEventListener('wheel', handleWheel);
			node.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			node.removeEventListener('dblclick', handleDoubleClick);
			node.style.cursor = '';
			node.style.touchAction = '';
			node.style.transform = '';
			node.style.transformOrigin = '';
			node.style.transition = '';
		}
	};
}
