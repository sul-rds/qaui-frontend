import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ArrayField from './ArrayField.svelte';

const stringArraySchema = { type: 'array', items: { type: 'string' } };

describe('ArrayField', () => {
	it('renders array items', async () => {
		const result = render(ArrayField, {
			props: {
				label: 'tags',
				schema: stringArraySchema,
				data: ['a', 'b', 'c'],
				originalData: ['a', 'b', 'c']
			}
		});

		const labels = result.container.querySelectorAll('span.label');
		expect(labels.length).toBe(3);
	});

	it('shows [No items] when array is empty', async () => {
		const result = render(ArrayField, {
			props: {
				label: 'tags',
				schema: stringArraySchema,
				data: [],
				originalData: []
			}
		});

		const noItems = result.container.querySelector('details > span');
		expect(noItems).toBeTruthy();
		expect(noItems.textContent).toBe('[No items]');
	});

	it('renders summary with label', async () => {
		const result = render(ArrayField, {
			props: {
				label: 'tags',
				schema: stringArraySchema,
				data: ['a'],
				originalData: ['a']
			}
		});

		const summary = result.container.querySelector('summary');
		expect(summary.textContent).toContain('tags');
	});

	it('shows add item button', async () => {
		const result = render(ArrayField, {
			props: {
				label: 'tags',
				schema: stringArraySchema,
				data: ['a'],
				originalData: ['a']
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const addBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Add Item') || b.querySelector('.bx--assistive-text')?.textContent === 'Add Item'
		);
		expect(addBtn).toBeTruthy();
	});

	it('shows removed items with restore button', async () => {
		const result = render(ArrayField, {
			props: {
				label: 'tags',
				schema: stringArraySchema,
				data: ['b'],
				originalData: ['a', 'b']
			}
		});

		// 'a' was removed, should have a restore button
		const buttons = result.container.querySelectorAll('button');
		const restoreBtns = Array.from(buttons).filter((b) =>
			b.textContent.includes('Revert') || b.querySelector('.bx--assistive-text')?.textContent === 'Revert'
		);
		expect(restoreBtns.length).toBeGreaterThanOrEqual(1);
	});

	it('shows diff entries for changed and unchanged items', async () => {
		const result = render(ArrayField, {
			props: {
				label: 'tags',
				schema: stringArraySchema,
				data: ['x', 'y'],
				originalData: ['a', 'y']
			}
		});

		// diff: 'a' removed, 'x' added, 'y' unmodified = 3 Fields rendered
		const labels = result.container.querySelectorAll('span.label');
		expect(labels.length).toBe(3);
	});

	it('details element is open by default', async () => {
		const result = render(ArrayField, {
			props: {
				label: 'tags',
				schema: stringArraySchema,
				data: ['a'],
				originalData: ['a']
			}
		});

		const details = result.container.querySelector('details');
		expect(details.open).toBe(true);
	});

	it('shows added items', async () => {
		const result = render(ArrayField, {
			props: {
				label: 'tags',
				schema: stringArraySchema,
				data: ['a', 'b', 'c'],
				originalData: ['a']
			}
		});

		// 'b' and 'c' are added
		const labels = result.container.querySelectorAll('span.label');
		expect(labels.length).toBe(3);
	});
});
