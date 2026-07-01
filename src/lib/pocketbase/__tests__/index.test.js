import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetOne, mockGetFullList, mockUpdate, mockAuthWithPassword, mockCollection } = vi.hoisted(() => ({
	mockGetOne: vi.fn(),
	mockGetFullList: vi.fn(),
	mockUpdate: vi.fn(),
	mockAuthWithPassword: vi.fn(),
	mockCollection: vi.fn()
}));

vi.mock('pocketbase', () => {
	mockCollection.mockReturnValue({
		getOne: mockGetOne,
		getFullList: mockGetFullList,
		update: mockUpdate,
		authWithPassword: mockAuthWithPassword
	});

	return {
		default: vi.fn().mockImplementation(function () {
			this.collection = mockCollection;
		})
	};
});

vi.mock('$lib/config', () => ({
	pbApiUrl: 'http://mock-pocketbase:8090'
}));

import {
	login,
	getProjectById,
	getImagesByProjectId,
	getImageById,
	updateImageRecord
} from '../index.js';

describe('PocketBase API Layer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('login', () => {
		it('returns success with user type on successful auth', async () => {
			const mockAuthData = { token: 'test-token', record: { id: 'user1' } };
			mockAuthWithPassword.mockResolvedValue(mockAuthData);

			const result = await login('user@test.com', 'password123');

			expect(result).toEqual({
				success: true,
				type: 'user',
				data: mockAuthData
			});
			expect(mockCollection).toHaveBeenCalledWith('users');
			expect(mockAuthWithPassword).toHaveBeenCalledWith('user@test.com', 'password123');
		});

		it('returns error on auth failure', async () => {
			mockAuthWithPassword.mockRejectedValue(new Error('Invalid credentials'));

			const result = await login('user@test.com', 'wrongpassword');

			expect(result).toEqual({
				success: false,
				error: 'Invalid credentials'
			});
			expect(mockCollection).toHaveBeenCalledWith('users');
		});

		it('always attempts user auth first', async () => {
			mockAuthWithPassword.mockResolvedValue({ token: 'token', record: {} });

			await login('test@test.com', 'pass');

			expect(mockCollection).toHaveBeenCalledWith('users');
			expect(mockAuthWithPassword).toHaveBeenCalledOnce();
		});
	});

	describe('getProjectById', () => {
		it('passes id to collection().getOne()', async () => {
			const mockProject = { id: 'proj123', name: 'Test Project' };
			mockGetOne.mockResolvedValue(mockProject);

			const result = await getProjectById('proj123');

			expect(result).toEqual(mockProject);
			expect(mockCollection).toHaveBeenCalledWith('projects');
			expect(mockGetOne).toHaveBeenCalledWith('proj123');
		});
	});

	describe('getImagesByProjectId', () => {
		it('passes filter and expand options to collection().getFullList()', async () => {
			const mockImages = [
				{ id: 'img1', project: 'proj123' },
				{ id: 'img2', project: 'proj123' }
			];
			mockGetFullList.mockResolvedValue(mockImages);

			const result = await getImagesByProjectId('proj123');

			expect(result).toEqual(mockImages);
			expect(mockCollection).toHaveBeenCalledWith('images');
			expect(mockGetFullList).toHaveBeenCalledWith({
				filter: 'project="proj123"',
				expand: 'approved_by'
			});
		});
	});

	describe('getImageById', () => {
		it('passes id to collection().getOne()', async () => {
			const mockImage = { id: 'img456', url: 'http://example.com/image.jpg' };
			mockGetOne.mockResolvedValue(mockImage);

			const result = await getImageById('img456');

			expect(result).toEqual(mockImage);
			expect(mockCollection).toHaveBeenCalledWith('images');
			expect(mockGetOne).toHaveBeenCalledWith('img456');
		});
	});

	describe('updateImageRecord', () => {
		it('passes id and data to collection().update()', async () => {
			const mockUpdated = { id: 'img789', status: 'approved' };
			mockUpdate.mockResolvedValue(mockUpdated);

			const result = await updateImageRecord('img789', { status: 'approved' });

			expect(result).toEqual(mockUpdated);
			expect(mockCollection).toHaveBeenCalledWith('images');
			expect(mockUpdate).toHaveBeenCalledWith('img789', { status: 'approved' });
		});

		it('handles partial updates correctly', async () => {
			const partialData = { notes: 'Updated notes' };
			mockUpdate.mockResolvedValue({ id: 'img101', ...partialData });

			const result = await updateImageRecord('img101', partialData);

			expect(mockUpdate).toHaveBeenCalledWith('img101', partialData);
		});
	});
});
