import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tooltip } from '../tooltip.js';

describe('tooltip action', () => {
	/** @type {HTMLElement} */
	let node;

	beforeEach(() => {
		node = document.createElement('button');
		document.body.appendChild(node);
	});

	afterEach(() => {
		document.body.removeChild(node);
	});

	it('creates a tippy instance on mount', () => {
		const result = tooltip(node, { content: 'Hello' });

		expect(node._tippy).toBeDefined();
		expect(node._tippy.props.content).toBe('Hello');

		result.destroy();
	});

	it('sets aria-label from content when not already present', () => {
		const result = tooltip(node, { content: 'Tooltip text' });

		expect(node.getAttribute('aria-label')).toBe('Tooltip text');

		result.destroy();
	});

	it('does not overwrite existing aria-label', () => {
		node.setAttribute('aria-label', 'Existing label');
		const result = tooltip(node, { content: 'New content' });

		expect(node.getAttribute('aria-label')).toBe('Existing label');

		result.destroy();
	});

	it('clears the HTML title attribute', () => {
		node.title = 'My Title';
		const result = tooltip(node, { content: 'Tooltip' });

		expect(node.title).toBe('');

		result.destroy();
	});

	it('uses title attribute as content fallback', () => {
		node.title = 'Title content';
		const result = tooltip(node, {});

		expect(node._tippy.props.content).toBe('Title content');

		result.destroy();
	});

	it('sets aria-label from content (priority over aria-label)', () => {
		node.setAttribute('aria-label', 'Aria content');
		const result = tooltip(node, { content: 'Explicit content' });

		expect(node._tippy.props.content).toBe('Explicit content');
		expect(node.getAttribute('aria-label')).toBe('Aria content');

		result.destroy();
	});

	it('destroy cleans up the tippy instance', () => {
		const result = tooltip(node, { content: 'Hello' });
		expect(node._tippy).toBeDefined();

		result.destroy();
		expect(node._tippy).toBeUndefined();
	});

	it('destroy is safe to call multiple times', () => {
		const result = tooltip(node, { content: 'Hello' });

		result.destroy();
		result.destroy();
		expect(node._tippy).toBeUndefined();
	});

	it('update with enabled: false destroys the instance', () => {
		const result = tooltip(node, { content: 'Hello' });
		expect(node._tippy).toBeDefined();

		result.update({ enabled: false });
		expect(node._tippy).toBeUndefined();
	});

	it('update with new params recreates the instance', () => {
		const result = tooltip(node, { content: 'Original' });
		expect(node._tippy.props.content).toBe('Original');

		result.update({ content: 'Updated' });
		expect(node._tippy.props.content).toBe('Updated');

		result.destroy();
	});

	it('update from enabled: false to enabled: true creates instance', () => {
		const result = tooltip(node, { enabled: false, content: 'Hello' });
		expect(node._tippy).toBeUndefined();

		result.update({ enabled: true, content: 'Now enabled' });
		expect(node._tippy).toBeDefined();
		expect(node._tippy.props.content).toBe('Now enabled');

		result.destroy();
	});

	it('does not create instance when enabled: false', () => {
		const result = tooltip(node, { enabled: false, content: 'Hello' });

		expect(node._tippy).toBeUndefined();

		result.destroy();
	});

	it('forwards tippy params', () => {
		const result = tooltip(node, {
			content: 'Hello',
			placement: 'right',
			arrow: false
		});

		expect(node._tippy.props.placement).toBe('right');
		expect(node._tippy.props.arrow).toBe(false);

		result.destroy();
	});
});
