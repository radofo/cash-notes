import { expect, test } from 'vitest';
import { getMonthLabelsForYear, getMonthLabelsLastXMonths } from './analysis';

test('getMonthLabelsLastXMonths', () => {
	const monthLabels = getMonthLabelsLastXMonths(3, new Date('2025-01-01'));
	expect(monthLabels).toEqual(['2025-01', '2024-12', '2024-11']);
});

test('getMonthLabelsLastXMonths', () => {
	const monthLabels = getMonthLabelsLastXMonths(3, new Date('2024-12-01'));
	expect(monthLabels).toEqual(['2024-12', '2024-11', '2024-10']);
});

test('getMonthLabelsForYear', () => {
	const monthLabels = getMonthLabelsForYear('2024');
	expect(monthLabels).toEqual([
		'2024-01',
		'2024-02',
		'2024-03',
		'2024-04',
		'2024-05',
		'2024-06',
		'2024-07',
		'2024-08',
		'2024-09',
		'2024-10',
		'2024-11',
		'2024-12'
	]);
});
