import { describe, it, expect, vi } from 'vitest';
import { debounce, deepEqual, similarity, diffArrays, inferEmptyValue } from '../utils.js';

describe('debounce', () => {
	it('calls the function after the delay', async () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 50);

		debounced();
		expect(fn).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(50);
		expect(fn).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});

	it('resets the timer on subsequent calls', async () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 50);

		debounced();
		await vi.advanceTimersByTimeAsync(30);
		debounced();
		await vi.advanceTimersByTimeAsync(30);
		expect(fn).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(20);
		expect(fn).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});

	it('passes arguments to the underlying function', async () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 50);

		debounced('a', 'b');
		await vi.advanceTimersByTimeAsync(50);
		expect(fn).toHaveBeenCalledWith('a', 'b');
		vi.useRealTimers();
	});

	it('cancel prevents invocation', async () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 50);

		debounced();
		debounced.cancel();
		await vi.advanceTimersByTimeAsync(100);
		expect(fn).not.toHaveBeenCalled();
		vi.useRealTimers();
	});
});

describe('deepEqual', () => {
	it('returns true for identical primitives', () => {
		expect(deepEqual(1, 1)).toBe(true);
		expect(deepEqual('foo', 'foo')).toBe(true);
		expect(deepEqual(true, true)).toBe(true);
	});

	it('returns false for different primitives', () => {
		expect(deepEqual(1, 2)).toBe(false);
		expect(deepEqual('foo', 'bar')).toBe(false);
		expect(deepEqual(true, false)).toBe(false);
	});

	it('returns false when comparing null to a value', () => {
		expect(deepEqual(null, null)).toBe(true);
		expect(deepEqual(null, 0)).toBe(false);
		expect(deepEqual(0, null)).toBe(false);
	});

	it('returns false for different types', () => {
		expect(deepEqual(1, '1')).toBe(false);
		expect(deepEqual([], {})).toBe(false);
	});

	it('compares arrays deeply', () => {
		expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
		expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
		expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
		expect(deepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
	});

	it('compares objects deeply', () => {
		expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
		expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
		expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
		expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
	});

	it('handles empty objects and arrays', () => {
		expect(deepEqual({}, {})).toBe(true);
		expect(deepEqual([], [])).toBe(true);
		expect(deepEqual({ a: {} }, { a: {} })).toBe(true);
	});
});

describe('similarity', () => {
	it('returns 1 for identical values', () => {
		expect(similarity('hello', 'hello')).toBe(1);
		expect(similarity(42, 42)).toBe(1);
		expect(similarity({ a: 1 }, { a: 1 })).toBe(1);
		expect(similarity(null, null)).toBe(1);
		expect(similarity([1], [1])).toBe(1);
	});

	it('returns 0 for different types', () => {
		expect(similarity('1', 1)).toBe(0);
	});

	it('returns 0 when null is compared with a non-null value', () => {
		expect(similarity(null, 'a')).toBe(0);
		expect(similarity('a', null)).toBe(0);
	});

	it('computes string similarity based on character alignment', () => {
		expect(similarity('abc', 'abc')).toBe(1);
		expect(similarity('abc', 'axc')).toBeCloseTo(2 / 3);
		expect(similarity('abc', 'xyz')).toBe(0);
	});

	it('returns 1 for two empty strings', () => {
		expect(similarity('', '')).toBe(1);
	});

	it('computes object similarity across keys', () => {
		const a = { x: 'hello', y: 'world' };
		const b = { x: 'hello', y: 'worlz' };
		const result = similarity(a, b);
		expect(result).toBeGreaterThan(0);
		expect(result).toBeLessThan(1);
	});

	it('returns 1 for two empty objects', () => {
		expect(similarity({}, {})).toBe(1);
	});

	it('returns 1 for identical arrays (via deepEqual)', () => {
		expect(similarity([1], [1])).toBe(1);
	});

	it('returns 0 for non-identical arrays (no string/object match path)', () => {
		expect(similarity([1], [2])).toBe(0);
	});
});

describe('diffArrays', () => {
	const eq = (a, b) => a === b;
	const sim = (a, b) => (a === b ? 1 : 0);

	it('returns all unmodified for identical arrays', () => {
		const result = diffArrays([1, 2, 3], [1, 2, 3], eq, sim);
		expect(result).toEqual([
			{ status: 'unmodified', value: 1, index: 0, originalIndex: 0 },
			{ status: 'unmodified', value: 2, index: 1, originalIndex: 1 },
			{ status: 'unmodified', value: 3, index: 2, originalIndex: 2 }
		]);
	});

	it('detects added items', () => {
		const result = diffArrays([], [1, 2], eq, sim);
		expect(result.every((e) => e.status === 'added')).toBe(true);
		expect(result.map((e) => e.value)).toEqual([1, 2]);
	});

	it('detects removed items', () => {
		const result = diffArrays([1, 2], [], eq, sim);
		expect(result.every((e) => e.status === 'removed')).toBe(true);
		expect(result.map((e) => e.value)).toEqual([1, 2]);
	});

	it('detects modified items with similarity above threshold', () => {
		const eqFn = (a, b) => a.id === b.id;
		const simFn = (a, b) => (a.id === b.id ? 0.8 : 0);
		const a = [{ id: 1, text: 'old' }];
		const b = [{ id: 1, text: 'new' }];
		const result = diffArrays(a, b, eqFn, simFn, 0.5);
		expect(result).toHaveLength(1);
		expect(result[0].status).toBe('modified');
		expect(result[0].value).toEqual({ id: 1, text: 'new' });
	});

	it('detects mixed add/remove/modify', () => {
		const a = [1, 2, 3];
		const b = [2, 3, 4];
		const result = diffArrays(a, b, eq, sim);
		expect(result).toEqual([
			{ status: 'removed', value: 1, index: null, originalIndex: 0 },
			{ status: 'unmodified', value: 2, index: 0, originalIndex: 1 },
			{ status: 'unmodified', value: 3, index: 1, originalIndex: 2 },
			{ status: 'added', value: 4, index: 2, originalIndex: null }
		]);
	});

	it('handles empty arrays', () => {
		expect(diffArrays([], [], eq, sim)).toEqual([]);
	});

	it('respects custom threshold', () => {
		const simFn = () => 0.3;
		const result = diffArrays([1], [2], eq, simFn, 0.5);
		expect(result).toEqual([
			{ status: 'removed', value: 1, index: null, originalIndex: 0 },
			{ status: 'added', value: 2, index: 0, originalIndex: null }
		]);
	});
});

describe('inferEmptyValue', () => {
	it('returns empty string for string type', () => {
		expect(inferEmptyValue({ type: 'string' })).toBe('');
	});

	it('returns 0 for number type', () => {
		expect(inferEmptyValue({ type: 'number' })).toBe(0);
	});

	it('returns 0 for integer type', () => {
		expect(inferEmptyValue({ type: 'integer' })).toBe(0);
	});

	it('returns false for boolean type', () => {
		expect(inferEmptyValue({ type: 'boolean' })).toBe(false);
	});

	it('returns empty object for object type', () => {
		expect(inferEmptyValue({ type: 'object' })).toEqual({});
	});

	it('returns empty array for array type', () => {
		expect(inferEmptyValue({ type: 'array' })).toEqual([]);
	});

	it('returns empty string for unknown type', () => {
		expect(inferEmptyValue({ type: 'something-else' })).toBe('');
	});

	it('returns empty string for null/undefined schema', () => {
		expect(inferEmptyValue(null)).toBe('');
		expect(inferEmptyValue(undefined)).toBe('');
	});
});
