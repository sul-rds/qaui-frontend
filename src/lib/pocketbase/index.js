/**
 * @typedef {import('./generated-types').TypedPocketBase} TypedPocketBase
 */

import PocketBase from 'pocketbase';

/** @type {TypedPocketBase} */
export const pb = new PocketBase('http://localhost:8090');

/**
 * Attempts to log in to the PocketBase instance using the provided email and password.
 * If user authentication fails, it will try admin authentication.
 * @param {string} email - The email address to log in with.
 * @param {string} password - The password to log in with.
 * @return {Promise<{success: boolean, type?: 'user' | 'admin', data?: any, error?: string}>}
 */
export async function login(email, password) {
	try {
		// First, try to authenticate as a regular user
		const authData = await pb.collection('users').authWithPassword(email, password);
		return {
			success: true,
			type: 'user',
			data: authData
		};
	} catch {
		// If user auth fails, try admin authentication
		try {
			const adminData = await pb.collection('_superusers').authWithPassword(email, password);
			return {
				success: true,
				type: 'admin',
				data: adminData
			};
		} catch (e) {
			console.error(e);
			return {
				success: false,
				error: 'Invalid credentials'
			};
		}
	}
}
