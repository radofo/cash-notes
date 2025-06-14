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
	forceDecimals = true
}: {
	amount?: number | null;
	sign?: string;
	forceDecimals?: boolean;
}): string {
	return amount !== null && amount !== undefined
		? `${sign ? `${sign} ` : ''}${formatCurrency(amount, forceDecimals)} €`
		: '-';
}

export function toFloat(input: string): number {
	if (!input) return 0;
	// Replace comma with dot to ensure proper parsing
	const normalizedInput = input.replace(',', '.');
	return Number.parseFloat(normalizedInput);
}
