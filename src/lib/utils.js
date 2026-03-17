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
