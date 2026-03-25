/**
 * @typedef {import('./generated-types').TypedPocketBase} TypedPocketBase
 * @typedef {import('./generated-types').ImagesResponse} ImagesResponse
 * @typedef {import('./generated-types').ProjectsRecord} ProjectsRecord
 */

import PocketBase from 'pocketbase';

import { pbApiUrl } from '$lib/config';

/** @type {TypedPocketBase} */
export const pb = new PocketBase(pbApiUrl);

/**
 * Attempts to log in to the PocketBase instance using the provided email and password.
 * If user authentication fails, it will try admin authentication.
 * @param {string} email - The email address to log in with.
 * @param {string} password - The password to log in with.
 * @return {Promise<{success: boolean, type?: 'user' | 'admin', data?: any, error?: string}>}
 */
export async function login(email, password) {
	try {
		const authData = await pb.collection('users').authWithPassword(email, password);
		return {
			success: true,
			type: 'user',
			data: authData
		};
	} catch (e) {
		console.error(e);
		return {
			success: false,
			error: 'Invalid credentials'
		};
	}
}

/**
 * Retrieves a single project record from the PocketBase instance by its ID.
 * @param {string} id - The ID of the project to retrieve.
 * @returns {Promise<ProjectsRecord>} The requested project record.
 */
export async function getProjectById(id) {
	return pb.collection('projects').getOne(id);
}

/**
 * Retrieves all image records associated with a given project ID.
 * @param {string} id - The ID of the project to retrieve image records for.
 * @returns {Promise<ImageWithApprovedBy[]>} The retrieved image records.
 */
export async function getImagesByProjectId(id) {
	return pb.collection('images').getFullList({ filter: `project="${id}"`, expand: 'approved_by' });
}

/**
 * Retrieves a single image record from the PocketBase instance by its ID.
 * @param {string} id - The ID of the image to retrieve.
 * @returns {Promise<ImagesResponse>} The retrieved image record.
 */
export async function getImageById(id) {
	return pb.collection('images').getOne(id);
}

/**
 * Updates an image record with new data.
 * @param {string} id - The image ID to update
 * @param {Partial<ImagesResponse>} data - The data to update
 * @returns {Promise<ImagesResponse>} The updated image record
 */
export async function updateImageRecord(id, data) {
	return pb.collection('images').update(id, data);
}
