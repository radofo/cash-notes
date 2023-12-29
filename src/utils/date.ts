export function dateToDateString(date: Date): string {
	let month = '' + (date.getMonth() + 1);
	let day = '' + date.getDate();
	const year = date.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}

export function getSurroundingYears(year: number): number[] {
	const final: number[] = [];
	for (let i = 5; i > 0; i--) {
		final.push(year - i);
	}
	final.push(year);
	for (let i = 1; i < 10; i++) {
		final.push(year + i);
	}
	return final;
}
