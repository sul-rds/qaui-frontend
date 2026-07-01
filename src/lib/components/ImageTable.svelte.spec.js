import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

vi.mock('$app/paths', () => ({
	resolve: (/** @type {string} */ path) => path
}));

import ImageTable from './ImageTable.svelte';

const mockImages = [
	{
		id: 'img1',
		title: 'Image One',
		image_url: 'http://example.com/1.jpg',
		data_source: 'Source A',
		approved: true,
		modified: false,
		flagged: false,
		approved_by: 'user1',
		expand: { approved_by: { name: 'Alice' } }
	},
	{
		id: 'img2',
		title: 'Image Two',
		image_url: 'http://example.com/2.jpg',
		data_source: 'Source B',
		approved: false,
		modified: true,
		flagged: true,
		approved_by: null,
		expand: { approved_by: null }
	}
];

describe('ImageTable', () => {
	it('renders paginated table with image rows', async () => {
		const result = render(ImageTable, { props: { images: mockImages } });

		const table = result.container.querySelector('table');
		expect(table).toBeTruthy();

		const rows = result.container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(2);
	});

	it('renders image titles as links', async () => {
		const result = render(ImageTable, { props: { images: mockImages } });

		const links = result.container.querySelectorAll('td a');
		expect(links.length).toBe(2);
		expect(links[0].textContent).toBe('Image One');
		expect(links[0].href).toContain('imageId=img1');
	});

	it('shows approved_by name when available', async () => {
		const result = render(ImageTable, { props: { images: mockImages } });

		const cells = result.container.querySelectorAll('td');
		const approvedByCell = Array.from(cells).find((c) => c.textContent.includes('Alice'));
		expect(approvedByCell).toBeTruthy();
	});

	it('shows empty for null approved_by', async () => {
		const result = render(ImageTable, { props: { images: mockImages } });

		const rows = result.container.querySelectorAll('tbody tr');
		// Second row has null approved_by
		const secondRow = rows[1];
		const cells = secondRow.querySelectorAll('td');
		// The approved_by column is the 4th cell (index 3)
		expect(cells[3].textContent.trim()).toBe('');
	});

	it('renders data_source values', async () => {
		const result = render(ImageTable, { props: { images: mockImages } });

		const cells = result.container.querySelectorAll('td');
		const sourceCell = Array.from(cells).find((c) => c.textContent.includes('Source A'));
		expect(sourceCell).toBeTruthy();
	});

	it('renders Pagination components', async () => {
		const result = render(ImageTable, { props: { images: mockImages } });

		// Carbon Pagination renders with navigation controls
		const pagination = result.container.querySelector('.bx--pagination');
		expect(pagination).toBeTruthy();
	});

	it('renders empty table when no images', async () => {
		const result = render(ImageTable, { props: { images: [] } });

		const rows = result.container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(0);
	});
});
