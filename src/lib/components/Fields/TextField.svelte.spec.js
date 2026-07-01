import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TextField from './TextField.svelte';

const defaultSchema = { type: 'string', description: 'A test field' };

describe('TextField', () => {
	it('renders value from props', async () => {
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'Hello World',
				originalValue: 'Hello World'
			}
		});

		const label = result.container.querySelector('span.label');
		expect(label.textContent).toBe('name:');

		const value = result.container.querySelector('span.value');
		expect(value.textContent).toBe('Hello World');
	});

	it('renders numeric label', async () => {
		const result = render(TextField, {
			props: {
				label: 0,
				schema: defaultSchema,
				value: 'test',
				originalValue: 'test'
			}
		});

		const label = result.container.querySelector('span.label');
		expect(label.textContent).toBe('0:');
	});

	it('shows revert button when status is modified', async () => {
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'changed',
				originalValue: 'original',
				status: 'modified'
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const revertBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Revert') || b.querySelector('.bx--assistive-text')?.textContent === 'Revert'
		);
		expect(revertBtn).toBeTruthy();
	});

	it('shows revert button when value differs from original and no status', async () => {
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'changed',
				originalValue: 'original'
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const revertBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Revert') || b.querySelector('.bx--assistive-text')?.textContent === 'Revert'
		);
		expect(revertBtn).toBeTruthy();
	});

	it('hides revert button when value matches original', async () => {
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'same',
				originalValue: 'same'
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const revertBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Revert') || b.querySelector('.bx--assistive-text')?.textContent === 'Revert'
		);
		expect(revertBtn).toBeUndefined();
	});

	it('shows delete button when onDelete provided', async () => {
		const onDelete = vi.fn();
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'test',
				originalValue: 'test',
				onDelete
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const deleteBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Delete') || b.querySelector('.bx--assistive-text')?.textContent === 'Delete'
		);
		expect(deleteBtn).toBeTruthy();
	});

	it('hides delete button when onDelete not provided', async () => {
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'test',
				originalValue: 'test'
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const deleteBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Delete') || b.querySelector('.bx--assistive-text')?.textContent === 'Delete'
		);
		expect(deleteBtn).toBeUndefined();
	});

	it('disables delete button when status is removed', async () => {
		const onDelete = vi.fn();
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'test',
				originalValue: 'test',
				status: 'removed',
				onDelete
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const deleteBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Delete') || b.querySelector('.bx--assistive-text')?.textContent === 'Delete'
		);
		expect(deleteBtn).toBeTruthy();
		expect(deleteBtn.disabled).toBe(true);
	});

	it('applies modified class when status is modified', async () => {
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'changed',
				originalValue: 'original',
				status: 'modified'
			}
		});

		const value = result.container.querySelector('span.value');
		expect(value.classList.contains('modified')).toBe(true);
	});

	it('applies added class when status is added', async () => {
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'new',
				originalValue: undefined,
				status: 'added'
			}
		});

		const value = result.container.querySelector('span.value');
		expect(value.classList.contains('added')).toBe(true);
	});

	it('applies removed class when status is removed', async () => {
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'deleted',
				originalValue: 'deleted',
				status: 'removed'
			}
		});

		const value = result.container.querySelector('span.value');
		expect(value.classList.contains('removed')).toBe(true);
	});

	it('disables contenteditable when status is removed', async () => {
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'deleted',
				originalValue: 'deleted',
				status: 'removed'
			}
		});

		const value = result.container.querySelector('span.value');
		expect(value.contentEditable).toBe('false');
	});

	it('calls onReset when revert button clicked', async () => {
		const onReset = vi.fn();
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'changed',
				originalValue: 'original',
				status: 'modified',
				onReset
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const revertBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Revert') || b.querySelector('.bx--assistive-text')?.textContent === 'Revert'
		);
		expect(revertBtn).toBeTruthy();
		revertBtn.click();
		expect(onReset).toHaveBeenCalledOnce();
	});

	it('calls onDelete when delete button clicked', async () => {
		const onDelete = vi.fn();
		const result = render(TextField, {
			props: {
				label: 'name',
				schema: defaultSchema,
				value: 'test',
				originalValue: 'test',
				onDelete
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const deleteBtn = Array.from(buttons).find((b) =>
			b.textContent.includes('Delete') || b.querySelector('.bx--assistive-text')?.textContent === 'Delete'
		);
		expect(deleteBtn).toBeTruthy();
		deleteBtn.click();
		expect(onDelete).toHaveBeenCalledOnce();
	});
});
