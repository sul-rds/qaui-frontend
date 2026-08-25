/**
 * @typedef {Object} ImagePanZoomParams
 * @prop {number} [minScale=0.5] - Minimum zoom level
 * @prop {number} [maxScale=5] - Maximum zoom level
 * @prop {number} [zoomSpeed=0.001] - Zoom sensitivity for wheel events
 * @prop {boolean} [constrain=false] - Constrain pan/zoom so image content always covers the parent
 * @prop {'width' | 'height'} [initialZoom] - Start zoomed to fill parent width or height
 * @prop {'center' | 'top'} [align='center'] - Vertical alignment of content when shorter than the parent
 */

/**
 * A Svelte action that adds pan and zoom functionality to an element.
 *
 * @param {HTMLElement} node
 * @param {ImagePanZoomParams} [params]
 * @returns {{ update: (newParams: ImagePanZoomParams) => void, destroy: () => void }}
 */
export function imagePanZoom(node, params = {}) {
	const DEFAULTS = { minScale: 0.5, maxScale: 5, zoomSpeed: 0.001, constrain: false, align: 'center' };
	let { minScale, maxScale, zoomSpeed, constrain, initialZoom, align } = { ...DEFAULTS, ...params };

	let scale = 1;
	let translateX = 0;
	let translateY = 0;
	let isPanning = false;
	let startX = 0;
	let startY = 0;

	const parent = node.parentElement;
	if (!parent) throw new Error('imagePanZoom: node must have a parent element');

	let parentRect = parent.getBoundingClientRect();

	const updateParentRect = () => {
		parentRect = parent.getBoundingClientRect();
		clampTranslate();
		applyTransform();
	};

	const resizeObserver = new ResizeObserver(updateParentRect);
	resizeObserver.observe(parent);

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
		const top = align === 'top' ? 0 : (nodeH - h) / 2;
		return { left: (nodeW - w) / 2, top, width: w, height: h };
	};

	const applyInitialZoom = () => {
		if (!initialZoom) return;
		const c = getContentBounds();
		if (c.width === 0 || c.height === 0) return;

		if (initialZoom === 'width') {
			scale = parentRect.width / c.width;
		} else if (initialZoom === 'height') {
			scale = parentRect.height / c.height;
		}

		scale = clampScale(scale);
		clampTranslate();
		applyTransform();
	};

	const applyTransform = () => {
		node.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
		node.style.transformOrigin = '0 0';
	};

	const clampScale = (/** @type {number} */ s) => {
		let effectiveMin = minScale;
		if (constrain) {
			effectiveMin = Math.max(effectiveMin, 1);
		}
		return Math.min(maxScale, Math.max(effectiveMin, s));
	};

	const clampTranslate = () => {
		if (!constrain) return;

		const c = getContentBounds();

		const maxX = -c.left * scale;
		const minX = parentRect.width - (c.left + c.width) * scale;
		const maxY = -c.top * scale;
		const minY = parentRect.height - (c.top + c.height) * scale;

		translateX = maxX < minX ? (maxX + minX) / 2 : Math.min(maxX, Math.max(minX, translateX));
		translateY =
			maxY < minY
				? align === 'top'
					? maxY
					: (maxY + minY) / 2
				: Math.min(maxY, Math.max(minY, translateY));
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
		if (initialZoom) {
			applyInitialZoom();
		} else {
			scale = 1;
			translateX = 0;
			translateY = 0;
			applyTransform();
		}
		node.style.transition = 'transform 0.2s ease';
		setTimeout(() => (node.style.transition = ''), 200);
	};

	node.addEventListener('wheel', handleWheel, { passive: false });
	node.addEventListener('mousedown', handleMouseDown);
	window.addEventListener('mousemove', handleMouseMove);
	window.addEventListener('mouseup', handleMouseUp);
	node.addEventListener('dblclick', handleDoubleClick);

	node.style.cursor = 'grab';
	node.style.touchAction = 'none';

	if (initialZoom) {
		const img = node.querySelector('img');
		if (img && !img.complete) {
			img.addEventListener('load', applyInitialZoom, { once: true });
		} else {
			applyInitialZoom();
		}
	}

	return {
		update(newParams) {
			({ minScale, maxScale, zoomSpeed, constrain, initialZoom, align } = {
				...DEFAULTS,
				...newParams
			});
		},
		destroy() {
			resizeObserver.disconnect();
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
