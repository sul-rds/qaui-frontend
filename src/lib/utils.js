/**
 * @template {(...args: any[]) => void} T
 * @param {T} fn
 * @param {number} delay
 * @returns {{ (...args: Parameters<T>): void, cancel: () => void }}
 */
export function debounce(fn, delay) {
	/** @type {ReturnType<typeof setTimeout>} */
	let timer;

	function debounced(/** @type {Parameters<T>} */ ...args) {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	}

	debounced.cancel = () => clearTimeout(timer);

	return debounced;
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function deepEqual(a, b) {
	if (a === b) return true;
	if (a === null || b === null) return false;
	if (typeof a !== typeof b) return false;

	if (Array.isArray(a)) {
		if (!Array.isArray(b) || a.length !== b.length) return false;
		return a.every((item, i) => deepEqual(item, b[i]));
	}

	if (typeof a === 'object') {
		const keysA = Object.keys(/** @type {object} */ (a));
		const keysB = Object.keys(/** @type {object} */ (b));
		if (keysA.length !== keysB.length) return false;
		return keysA.every((key) =>
			deepEqual(
				/** @type {Record<string, unknown>} */ (a)[key],
				/** @type {Record<string, unknown>} */ (b)[key]
			)
		);
	}

	return false;
}
