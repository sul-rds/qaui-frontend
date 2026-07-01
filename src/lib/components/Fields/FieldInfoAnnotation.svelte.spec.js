import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FieldInfoAnnotation from './FieldInfoAnnotation.svelte';

describe('FieldInfoAnnotation', () => {
	it('renders info icon with description', async () => {
		const result = render(FieldInfoAnnotation, { props: { description: 'Helpful tooltip' } });

		const icon = result.container.querySelector('span.i');
		expect(icon).toBeTruthy();
		expect(icon.querySelector('svg')).toBeTruthy();
	});

	it('renders empty span without description', async () => {
		const result = render(FieldInfoAnnotation, { props: { description: undefined } });

		const icon = result.container.querySelector('span.i');
		expect(icon).toBeTruthy();
		expect(icon.querySelector('svg')).toBeNull();
	});

	it('renders empty span with empty string description', async () => {
		const result = render(FieldInfoAnnotation, { props: { description: '' } });

		const icon = result.container.querySelector('span.i');
		expect(icon).toBeTruthy();
		expect(icon.querySelector('svg')).toBeNull();
	});
});
