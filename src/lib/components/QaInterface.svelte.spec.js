import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import QaInterface from './QaInterface.svelte';

const mockImage = {
	id: 'img1',
	title: 'Test Image',
	image_url: 'http://example.com/test.jpg',
	modified: true,
	approved: false,
	flagged: false
};

const schema = {
	type: 'object',
	properties: {
		name: { type: 'string' }
	}
};

describe('QaInterface', () => {
	it('renders side-by-side layout', async () => {
		const result = render(QaInterface, {
			props: {
				image: mockImage,
				data: { name: 'test' },
				originalData: { name: 'original' },
				schema,
				toggleApproved: vi.fn(),
				toggleFlagged: vi.fn()
			}
		});

		const article = result.container.querySelector('article');
		expect(article).toBeTruthy();

		const fields = result.container.querySelector('section.fields');
		expect(fields).toBeTruthy();

		const imageSection = result.container.querySelector('section.image');
		expect(imageSection).toBeTruthy();
	});

	it('renders Revert button disabled when not modified', async () => {
		const result = render(QaInterface, {
			props: {
				image: { ...mockImage, modified: false },
				data: { name: 'test' },
				originalData: { name: 'test' },
				schema,
				toggleApproved: vi.fn(),
				toggleFlagged: vi.fn()
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const revertBtn = Array.from(buttons).find((b) => b.textContent.includes('Revert'));
		expect(revertBtn).toBeTruthy();
		expect(revertBtn.disabled).toBe(true);
	});

	it('renders Revert button enabled when modified', async () => {
		const result = render(QaInterface, {
			props: {
				image: { ...mockImage, modified: true },
				data: { name: 'changed' },
				originalData: { name: 'original' },
				schema,
				toggleApproved: vi.fn(),
				toggleFlagged: vi.fn()
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const revertBtn = Array.from(buttons).find((b) => b.textContent.includes('Revert'));
		expect(revertBtn).toBeTruthy();
		expect(revertBtn.disabled).toBe(false);
	});

	it('shows Flag when not flagged', async () => {
		const result = render(QaInterface, {
			props: {
				image: { ...mockImage, flagged: false },
				data: { name: 'test' },
				originalData: { name: 'test' },
				schema,
				toggleApproved: vi.fn(),
				toggleFlagged: vi.fn()
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const flagBtn = Array.from(buttons).find((b) => b.textContent.includes('Flag'));
		expect(flagBtn).toBeTruthy();
		expect(flagBtn.textContent).toContain('Flag');
		expect(flagBtn.textContent).not.toContain('Unflag');
	});

	it('shows Unflag when flagged', async () => {
		const result = render(QaInterface, {
			props: {
				image: { ...mockImage, flagged: true },
				data: { name: 'test' },
				originalData: { name: 'test' },
				schema,
				toggleApproved: vi.fn(),
				toggleFlagged: vi.fn()
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const flagBtn = Array.from(buttons).find((b) => b.textContent.includes('Unflag'));
		expect(flagBtn).toBeTruthy();
	});

	it('shows Approve when not approved', async () => {
		const result = render(QaInterface, {
			props: {
				image: { ...mockImage, approved: false },
				data: { name: 'test' },
				originalData: { name: 'test' },
				schema,
				toggleApproved: vi.fn(),
				toggleFlagged: vi.fn()
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const approveBtn = Array.from(buttons).find((b) => b.textContent.includes('Approve'));
		expect(approveBtn).toBeTruthy();
		expect(approveBtn.textContent).toContain('Approve');
		expect(approveBtn.textContent).not.toContain('Unapprove');
	});

	it('shows Unapprove when approved', async () => {
		const result = render(QaInterface, {
			props: {
				image: { ...mockImage, approved: true },
				data: { name: 'test' },
				originalData: { name: 'test' },
				schema,
				toggleApproved: vi.fn(),
				toggleFlagged: vi.fn()
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const approveBtn = Array.from(buttons).find((b) => b.textContent.includes('Unapprove'));
		expect(approveBtn).toBeTruthy();
	});

	it('calls toggleFlagged when Flag button clicked', async () => {
		const toggleFlagged = vi.fn();
		const result = render(QaInterface, {
			props: {
				image: mockImage,
				data: { name: 'test' },
				originalData: { name: 'test' },
				schema,
				toggleApproved: vi.fn(),
				toggleFlagged
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const flagBtn = Array.from(buttons).find((b) => b.textContent.includes('Flag'));
		flagBtn.click();
		expect(toggleFlagged).toHaveBeenCalledOnce();
	});

	it('calls toggleApproved when Approve button clicked', async () => {
		const toggleApproved = vi.fn();
		const result = render(QaInterface, {
			props: {
				image: mockImage,
				data: { name: 'test' },
				originalData: { name: 'test' },
				schema,
				toggleApproved,
				toggleFlagged: vi.fn()
			}
		});

		const buttons = result.container.querySelectorAll('button');
		const approveBtn = Array.from(buttons).find((b) => b.textContent.includes('Approve'));
		approveBtn.click();
		expect(toggleApproved).toHaveBeenCalledOnce();
	});

	it('renders fields section with data', async () => {
		const result = render(QaInterface, {
			props: {
				image: mockImage,
				data: { name: 'Hello' },
				originalData: { name: 'Hello' },
				schema,
				toggleApproved: vi.fn(),
				toggleFlagged: vi.fn()
			}
		});

		const value = result.container.querySelector('span.value');
		expect(value).toBeTruthy();
		expect(value.textContent).toBe('Hello');
	});
});
