import { describe, expect, test } from 'vitest';
import type { CashFlow } from '../types/supabase';
import { isInMonth } from './cash_flow';

function cashFlowOn(date: string): CashFlow {
	return { id: '1', createdAt: '', date, name: 'Test', amount: 1, owner: 'u' };
}

describe('isInMonth', () => {
	// month is 0-based: 10 = November
	test.each([
		['2026-11-01', true],
		['2026-11-12', true],
		['2026-11-30', true],
		['2026-10-31', false],
		['2026-12-01', false]
	])('%s in November 2026 → %s', (date, expected) => {
		expect(isInMonth(cashFlowOn(date), 10, 2026)).toBe(expected);
	});
});
