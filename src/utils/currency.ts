export function formatCurrency(rawAmount: number): string {
	const twoDecimalString = rawAmount.toFixed(2);
	const [euros, cents] = twoDecimalString.split('.');
	if (cents === '00') {
		return euros;
	} else {
		return twoDecimalString.replace('.', ',');
	}
}
