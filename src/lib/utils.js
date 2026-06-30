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

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {number} 0 (completely different) to 1 (identical)
 */
export function similarity(a, b) {
	if (deepEqual(a, b)) return 1;
	if (typeof a !== typeof b) return 0;
	if (a === null || b === null) return 0;

	if (typeof a === 'string' && typeof b === 'string') {
		// longer common prefix/length ratio is a cheap string similarity
		const longer = Math.max(a.length, b.length);
		if (longer === 0) return 1;
		const matching = [...a].filter((ch, i) => ch === b[i]).length;
		return matching / longer;
	}

	if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);
		const allKeys = new Set([...keysA, ...keysB]);
		if (allKeys.size === 0) return 1;
		// average similarity across all keys
		let total = 0;
		for (const key of allKeys) {
			total += similarity(
				/** @type {Record<string, unknown>} */ (a)[key],
				/** @type {Record<string, unknown>} */ (b)[key]
			);
		}
		return total / allKeys.size;
	}

	return 0;
}

/**
 * @template T
 * @param {T[]} a - original array
 * @param {T[]} b - current array
 * @param {(a: T, b: T) => boolean} eq
 * @param {(a: T, b: T) => number} similarityFn
 * @param {number} [threshold=0.5]
 * @returns {DiffEntry<T>[]}
 */
export function diffArrays(a, b, eq, similarityFn, threshold = 0.5) {
	const m = a.length,
		n = b.length;

	// Build similarity table
	const table = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const sim = similarityFn(a[i - 1], b[j - 1]);
			if (sim >= threshold) {
				// Treat as a match, weighted by similarity, but allow skipping if it gives a better score
				table[i][j] = Math.max(table[i - 1][j - 1] + sim, table[i - 1][j], table[i][j - 1]);
			} else {
				table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
			}
		}
	}

	// Backtrack
	const result = [];
	let i = m,
		j = n;
	while (i > 0 || j > 0) {
		const sim = i > 0 && j > 0 ? similarityFn(a[i - 1], b[j - 1]) : 0;
		if (i > 0 && j > 0 && sim >= threshold && table[i][j] === table[i - 1][j - 1] + sim) {
			result.unshift(
				/** @type {DiffEntry<T>} */ ({
					status: sim === 1 ? 'unmodified' : 'modified',
					value: b[j - 1],
					index: j - 1,
					originalIndex: i - 1
				})
			);
			i--;
			j--;
		} else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
			result.unshift(
				/** @type {DiffEntry<T>} */ ({
					status: 'added',
					value: b[j - 1],
					index: j - 1,
					originalIndex: null
				})
			);
			j--;
		} else {
			result.unshift(
				/** @type {DiffEntry<T>} */ ({
					status: 'removed',
					value: a[i - 1],
					index: null,
					originalIndex: i - 1
				})
			);
			i--;
		}
	}
	return result;
}

/**
 * @param {JSONSchema7} itemSchema
 * @returns {any}
 */
export function inferEmptyValue(itemSchema) {
	switch (itemSchema?.type) {
		case 'string':
			return '';
		case 'number':
		case 'integer':
			return 0;
		case 'boolean':
			return false;
		case 'object':
			return {};
		case 'array':
			return [];
		default:
			return '';
	}
}
