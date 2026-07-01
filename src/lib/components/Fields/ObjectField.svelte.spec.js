import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ObjectField from './ObjectField.svelte';

const schema = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		age: { type: 'number' }
	}
};

describe('ObjectField', () => {
	it('renders object keys as collapsible details sections when not top', async () => {
		const result = render(ObjectField, {
			props: {
				schema,
				data: { name: 'Alice', age: 30 },
				originalData: { name: 'Alice', age: 30 }
			}
		});

		const details = result.container.querySelector('details');
		expect(details).toBeTruthy();
		expect(details.open).toBe(true);
	});

	it('renders bare Fields when top is true', async () => {
		const result = render(ObjectField, {
			props: {
				top: true,
				schema,
				data: { name: 'Alice', age: 30 },
				originalData: { name: 'Alice', age: 30 }
			}
		});

		// Top-level renders Fields for each key directly (no details wrapper)
		const details = result.container.querySelector('details');
		expect(details).toBeNull();

		const labels = result.container.querySelectorAll('span.label');
		expect(labels.length).toBe(2);
	});

	it('orders properties by schema then data keys', async () => {
		const result = render(ObjectField, {
			props: {
				top: true,
				schema: {
					type: 'object',
					properties: {
						first: { type: 'string' },
						second: { type: 'string' },
						extra: { type: 'string' }
					}
				},
				data: { extra: 'extra', first: '1', second: '2' },
				originalData: { first: '1', second: '2', extra: 'extra' }
			}
		});

		const labels = result.container.querySelectorAll('span.label');
		const texts = Array.from(labels).map((l) => l.textContent);
		expect(texts).toEqual(['first:', 'second:', 'extra:']);
	});

	it('shows summary label', async () => {
		const result = render(ObjectField, {
			props: {
				label: 'person',
				schema,
				data: { name: 'Alice' },
				originalData: { name: 'Alice' }
			}
		});

		const summary = result.container.querySelector('summary');
		expect(summary.textContent).toContain('person');
	});

	it('shows [removed] in summary when status is removed', async () => {
		const result = render(ObjectField, {
			props: {
				label: 'person',
				schema,
				data: { name: 'Alice' },
				originalData: { name: 'Alice' },
				status: 'removed'
			}
		});

		const summary = result.container.querySelector('summary');
		expect(summary.textContent).toContain('[removed]');
	});

	it('applies modified class to details when status is modified', async () => {
		const result = render(ObjectField, {
			props: {
				label: 'person',
				schema,
				data: { name: 'Bob' },
				originalData: { name: 'Alice' },
				status: 'modified'
			}
		});

		const details = result.container.querySelector('details');
		expect(details.classList.contains('modified')).toBe(true);
	});

	it('applies removed class to details when status is removed', async () => {
		const result = render(ObjectField, {
			props: {
				label: 'person',
				schema,
				data: { name: 'Alice' },
				originalData: { name: 'Alice' },
				status: 'removed'
			}
		});

		const details = result.container.querySelector('details');
		expect(details.classList.contains('removed')).toBe(true);
	});

	it('shows delete button when onDelete provided', async () => {
		const onDelete = vi.fn();
		const result = render(ObjectField, {
			props: {
				label: 'person',
				schema,
				data: { name: 'Alice' },
				originalData: { name: 'Alice' },
				onDelete
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const deleteBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Delete') || b.querySelector('.bx--assistive-text')?.textContent === 'Delete'
		);
		expect(deleteBtn).toBeTruthy();
	});

	it('shows restore button when onReset provided', async () => {
		const onReset = vi.fn();
		const result = render(ObjectField, {
			props: {
				label: 'person',
				schema,
				data: { name: 'Alice' },
				originalData: { name: 'Alice' },
				onReset,
				status: 'removed'
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const restoreBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Restore') || b.querySelector('.bx--assistive-text')?.textContent === 'Restore'
		);
		expect(restoreBtn).toBeTruthy();
	});
});
