import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';

const { mockGetFullList, mockCollection } = vi.hoisted(() => ({
	mockGetFullList: vi.fn(),
	mockCollection: vi.fn()
}));

vi.mock('$lib/pocketbase', () => {
	mockCollection.mockReturnValue({
		getFullList: mockGetFullList
	});
	return {
		pb: {
			collection: mockCollection
		}
	};
});

import Projects from './Projects.svelte';

describe('Projects', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders list of projects', async () => {
		mockGetFullList.mockResolvedValue([
			{ id: 'p1', name: 'Project Alpha', description: 'First project' },
			{ id: 'p2', name: 'Project Beta', description: 'Second project' }
		]);

		const result = render(Projects);

		await vi.waitFor(() => {
			const tiles = result.container.querySelectorAll('a');
			expect(tiles.length).toBe(2);
		});
	});

	it('each tile links to project detail page', async () => {
		mockGetFullList.mockResolvedValue([
			{ id: 'p1', name: 'Project Alpha', description: 'First project' }
		]);

		const result = render(Projects);

		await vi.waitFor(() => {
			const tile = result.container.querySelector('a');
			expect(tile).toBeTruthy();
			expect(tile.href).toContain('project/?projectId=p1');
		});
	});

	it('displays project name and description', async () => {
		mockGetFullList.mockResolvedValue([
			{ id: 'p1', name: 'My Project', description: 'A great project' }
		]);

		const result = render(Projects);

		await vi.waitFor(() => {
			const heading = result.container.querySelector('h3');
			expect(heading.textContent).toContain('My Project');

			const desc = result.container.querySelector('p');
			expect(desc.textContent).toBe('A great project');
		});
	});

	it('calls pb.collection with correct collection name', async () => {
		mockGetFullList.mockResolvedValue([]);

		render(Projects);

		expect(mockCollection).toHaveBeenCalledWith('projects');
	});
});
