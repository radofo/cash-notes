export function formatCurrency(rawAmount: number, forceDecimals = false): string {
	const twoDecimalString = rawAmount.toFixed(2);
	const [euros, cents] = twoDecimalString.split('.');
	if (cents === '00' && !forceDecimals) {
		return euros;
	} else {
		return twoDecimalString.replace('.', ',');
	}
}

export function displayCurrency({
	amount,
	sign,
	forceDecimals = false
}: {
	amount?: number;
	sign?: string;
	forceDecimals?: boolean;
}): string {
	return amount !== 0 && amount !== undefined
		? `${sign ?? ''}${formatCurrency(amount, forceDecimals)} €`
		: '-';
}
