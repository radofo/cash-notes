import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import type { Month } from '../types/date';
dayjs.extend(objectSupport);

export function dateToDateString(date: Date): string {
	let month = '' + (date.getMonth() + 1);
	let day = '' + date.getDate();
	const year = date.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}

export function getMonthAndYearFromDateString(dateString: string): Month | undefined {
	const parts = dateString.split('-');
	const monthString = parts[1];
	const yearString = parts[0];
	if (monthString && yearString) {
		return {
			month: parseInt(monthString) - 1,
			year: parseInt(yearString)
		};
	}
}

export function monthToDateString(month: number, year: number): string {
	return dateToDateString(
		dayjs({
			year,
			month,
			day: 1
		}).toDate()
	);
}

export function getSurroundingYears(referenceYear: number, minus = 5, plus = 10): number[] {
	const final: number[] = [];
	for (let i = minus; i > 0; i--) {
		final.push(referenceYear - i);
	}
	final.push(referenceYear);
	for (let i = 1; i < plus; i++) {
		final.push(referenceYear + i);
	}
	return final;
}

export const months = [
	'Januar',
	'Februar',
	'März',
	'April',
	'Mai',
	'Juni',
	'Juli',
	'August',
	'September',
	'Oktober',
	'November',
	'Dezember'
];
