import { expect, test } from 'vitest';
import { formatCurrency } from './currency';

test('formatCurrency', () => {
	const res = formatCurrency(1.2345);
	expect(res).toBe('1,23');
});
