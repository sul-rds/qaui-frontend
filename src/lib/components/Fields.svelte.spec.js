import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fields from './Fields.svelte';

const stringSchema = { type: 'string' };
const objectSchema = { type: 'object', properties: { name: { type: 'string' } } };
const arraySchema = { type: 'array', items: { type: 'string' } };

describe('Fields', () => {
	it('dispatches to TextField when data is a string', async () => {
		const result = render(Fields, {
			props: {
				label: 'title',
				schema: stringSchema,
				data: 'Hello',
				originalData: 'Hello'
			}
		});

		const label = result.container.querySelector('span.label');
		expect(label).toBeTruthy();
		expect(label.textContent).toBe('title:');
	});

	it('dispatches to TextField when data is a number', async () => {
		const result = render(Fields, {
			props: {
				label: 'count',
				schema: { type: 'number' },
				data: 42,
				originalData: 42
			}
		});

		const label = result.container.querySelector('span.label');
		expect(label).toBeTruthy();
		expect(label.textContent).toBe('count:');
	});

	it('dispatches to TextField when data is a boolean', async () => {
		const result = render(Fields, {
			props: {
				label: 'active',
				schema: { type: 'boolean' },
				data: true,
				originalData: true
			}
		});

		const label = result.container.querySelector('span.label');
		expect(label).toBeTruthy();
	});

	it('dispatches to ObjectField when data is a plain object', async () => {
		const result = render(Fields, {
			props: {
				top: true,
				schema: objectSchema,
				data: { name: 'test' },
				originalData: { name: 'test' }
			}
		});

		// ObjectField with top=true renders bare Fields for each key
		const label = result.container.querySelector('span.label');
		expect(label).toBeTruthy();
		expect(label.textContent).toBe('name:');
	});

	it('dispatches to ArrayField when data is an array', async () => {
		const result = render(Fields, {
			props: {
				label: 'items',
				schema: arraySchema,
				data: ['a', 'b'],
				originalData: ['a', 'b']
			}
		});

		// ArrayField renders a details element
		const details = result.container.querySelector('details');
		expect(details).toBeTruthy();
	});

	it('renders null data as primitive (TextField)', async () => {
		const result = render(Fields, {
			props: {
				label: 'empty',
				schema: { type: 'string' },
				data: null,
				originalData: null
			}
		});

		const label = result.container.querySelector('span.label');
		expect(label).toBeTruthy();
		expect(label.textContent).toBe('empty:');
	});

	it('forwards status prop to TextField', async () => {
		const result = render(Fields, {
			props: {
				label: 'name',
				schema: stringSchema,
				data: 'changed',
				originalData: 'original',
				status: 'modified'
			}
		});

		const value = result.container.querySelector('span.value');
		expect(value.classList.contains('modified')).toBe(true);
	});
});
