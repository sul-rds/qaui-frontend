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
 * Prefixes an image's `image_url` with its expanded project's `image_base`.
 * @param {ImageWithApprovedBy} image - An image record with `project` expanded.
 * @returns {ImageWithApprovedBy} The image record with an absolute `image_url`.
 */
function withImageUrl(image) {
	return {
		...image,
		image_url: `${image.expand?.project?.image_base ?? ''}${image.image_url}`
	};
}

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
 * @param {string} [filters] - Optional filters to apply to the image records.
 * @returns {Promise<ImageWithApprovedBy[]>} The retrieved image records.
 */
export async function getImagesByProjectId(id, filters) {
	const filter = filters ? `project="${id}" && ${filters}` : `project="${id}"`;
	const images = /** @type {ImageWithApprovedBy[]} */ (
		await pb.collection('images').getFullList({ filter, expand: 'approved_by,project' })
	);
	return images.map(withImageUrl);
}

/**
 * Retrieves a single image record from the PocketBase instance by its ID.
 * @param {string} id - The ID of the image to retrieve.
 * @returns {Promise<ImageWithApprovedBy>} The retrieved image record.
 */
export async function getImageById(id) {
	const image = /** @type {ImageWithApprovedBy} */ (
		await pb.collection('images').getOne(id, { expand: 'approved_by,project' })
	);
	return withImageUrl(image);
}

/**
 * Searches image records for a query across the given fields.
 * @param {string} query - The search term.
 * @param {{ title?: boolean, data?: boolean, notes?: boolean }} searchFields - Which fields to search.
 * @returns {Promise<import('pocketbase').ListResult<ImageWithApprovedBy>>} The matching image records.
 */
export async function searchImages(query, searchFields) {
	const filter = Object.entries(searchFields)
		.filter(([, v]) => v)
		.map(([f]) => `${f} ~ {:q}`)
		.join(' || ');

	const results = /** @type {import('pocketbase').ListResult<ImageWithApprovedBy>} */ (
		await pb.collection('images').getList(1, 20, {
			filter: pb.filter(filter, { q: query }),
			expand: 'project'
		})
	);
	results.items = results.items.map(withImageUrl);
	return results;
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
