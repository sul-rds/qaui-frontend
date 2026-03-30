/**
 * @typedef {import('$lib/pocketbase/generated-types').ImagesResponse} ImagesResponse
 * @typedef {import('$lib/pocketbase/generated-types').UsersResponse} UsersResponse
 *
 * @typedef {import('$lib/pocketbase/generated-types').ImagesResponse<unknown, unknown, { approved_by: UsersResponse }>} ImageWithApprovedBy
 */

/**
 * @typedef {import('json-schema').JSONSchema7} JSONSchema7
 */

/**
 * @typedef {'unmodified' | 'added' | 'removed' | 'modified'} DiffStatus
 */

/**
 * @template T
 * @typedef {Object} DiffEntry
 * @property {DiffStatus} status
 * @property {T} value
 * @property {number | null} index
 * @property {number | null} originalIndex
 */
