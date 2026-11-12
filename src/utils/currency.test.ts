import { describe, expect, test } from 'vitest';
import { formatCurrency, parseTransactionAmount } from './currency';

test('formatCurrency', () => {
	const res = formatCurrency(1.2345);
	expect(res).toBe('1,23');
});

describe('parseTransactionAmount', () => {
	test.each([
		['12,50 €', 12.5, 'EUR'],
		['12,50 €', 12.5, 'EUR'],
		['€12.50', 12.5, 'EUR'],
		['1.234,56 €', 1234.56, 'EUR'],
		['$1,234.56', 1234.56, 'USD'],
		['45,00 $', 45, 'USD'],
		['US$45.00', 45, 'USD'],
		['£3.20', 3.2, 'GBP'],
		['CHF 12.50', 12.5, 'CHF'],
		['USD 45.00', 45, 'USD'],
		['-12,50 €', 12.5, 'EUR'],
		['1.234 €', 1234, 'EUR'],
		['12,50', 12.5, null],
		// Europe
		['12,50 zł', 12.5, 'PLN'],
		['250 Kč', 250, 'CZK'],
		['3.500 Ft', 3500, 'HUF'],
		['12,50 лв.', 12.5, 'BGN'],
		['Fr. 12.50', 12.5, 'CHF'],
		['99,90 ₺', 99.9, 'TRY'],
		['120 ₴', 120, 'UAH'],
		['12,50 kr', 12.5, null],
		['NOK 129,00', 129, 'NOK'],
		// North America
		['CA$10.00', 10, 'CAD'],
		['MX$250.00', 250, 'MXN'],
		// Asia
		['¥1,200', 1200, 'JPY'],
		['1,200円', 1200, 'JPY'],
		['CN¥88.50', 88.5, 'CNY'],
		['₩15,000', 15000, 'KRW'],
		['15,000원', 15000, 'KRW']
	])('%s', (input, amount, currency) => {
		expect(parseTransactionAmount(input)).toEqual({ amount, currency });
	});

	test('passes numbers through', () => {
		expect(parseTransactionAmount(12.5)).toEqual({ amount: 12.5, currency: null });
	});

	test.each([[''], [null], [undefined], [{}]])('invalid input %s', (input) => {
		expect(parseTransactionAmount(input)).toEqual({ amount: null, currency: null });
	});

	test('keeps the currency when the amount is missing', () => {
		expect(parseTransactionAmount('€')).toEqual({ amount: null, currency: 'EUR' });
	});
});
