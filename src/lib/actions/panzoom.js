/**
 * @typedef {Object} PanZoomParams
 * @prop {number} [minScale=0.5] - Minimum zoom level
 * @prop {number} [maxScale=5] - Maximum zoom level
 * @prop {number} [zoomSpeed=0.001] - Zoom sensitivity for wheel events
 * @prop {boolean} [constrain=false] - Constrain pan/zoom so image content always covers the parent
 */

/**
 * A Svelte action that adds pan and zoom functionality to an element.
 *
 * @param {HTMLElement} node
 * @param {PanZoomParams} [params]
 * @returns {{ update: (newParams: PanZoomParams) => void, destroy: () => void }}
 */
export function panzoom(node, params = {}) {
	let { minScale = 0.5, maxScale = 5, zoomSpeed = 0.001, constrain = false } = params;

	let scale = 1;
	let translateX = 0;
	let translateY = 0;
	let isPanning = false;
	let startX = 0;
	let startY = 0;

	const parentRect = node.parentElement.getBoundingClientRect();

	const getContentBounds = () => {
		const img = node.querySelector('img');
		const nodeW = node.offsetWidth;
		const nodeH = node.offsetHeight;
		if (!img || !img.naturalWidth || !img.naturalHeight) {
			return { left: 0, top: 0, width: nodeW, height: nodeH };
		}
		const fitScale = Math.min(nodeW / img.naturalWidth, nodeH / img.naturalHeight);
		const w = img.naturalWidth * fitScale;
		const h = img.naturalHeight * fitScale;
		return { left: (nodeW - w) / 2, top: (nodeH - h) / 2, width: w, height: h };
	};

	const applyTransform = () => {
		node.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
		node.style.transformOrigin = '0 0';
	};

	const clampScale = (s) => Math.min(maxScale, Math.max(minScale, s));

	const clampTranslate = () => {
		if (!constrain) return;

		const c = getContentBounds();

		const maxX = -c.left * scale;
		const minX = parentRect.width - (c.left + c.width) * scale;
		const maxY = -c.top * scale;
		const minY = parentRect.height - (c.top + c.height) * scale;

		translateX = maxX < minX ? (maxX + minX) / 2 : Math.min(maxX, Math.max(minX, translateX));
		translateY = maxY < minY ? (maxY + minY) / 2 : Math.min(maxY, Math.max(minY, translateY));
	};

	const handleWheel = (/** @type {WheelEvent} */ e) => {
		e.preventDefault();

		const mouseX = e.clientX - parentRect.left;
		const mouseY = e.clientY - parentRect.top;

		const prevScale = scale;
		scale = clampScale(scale * (1 - e.deltaY * zoomSpeed));

		const ratio = scale / prevScale;
		translateX = mouseX - ratio * (mouseX - translateX);
		translateY = mouseY - ratio * (mouseY - translateY);

		clampTranslate();
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
		clampTranslate();
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
			({ minScale, maxScale, zoomSpeed, constrain } = newParams);
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
