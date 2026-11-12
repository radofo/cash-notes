import { currencyFromSymbol } from './currencySymbols';

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

/**
 * Parses a localized amount string as sent by the iOS Shortcuts "Transaction" automation,
 * e.g. "12,50 €", "€12.50", "$1,234.56", "1.234,56 €", "USD 45.00".
 * Returns the absolute amount and an ISO 4217 code (null if it cannot be determined).
 */
export function parseTransactionAmount(input: unknown): {
	amount: number | null;
	currency: string | null;
} {
	if (typeof input === 'number') {
		return { amount: Number.isFinite(input) ? Math.abs(input) : null, currency: null };
	}
	if (typeof input !== 'string' || !input.trim()) {
		return { amount: null, currency: null };
	}

	const currencyPart = input.replace(/[\d.,\s  +-]/g, '');
	const currency = currencyFromSymbol(currencyPart);

	// Strip separators that belong to the symbol, e.g. "Fr. 12.50" or "12,50 лв."
	const numberPart = input.replace(/[^\d.,]/g, '').replace(/^[.,]+|[.,]+$/g, '');
	if (!/\d/.test(numberPart)) {
		return { amount: null, currency };
	}

	// The last separator is the decimal separator if 1-2 digits follow it,
	// otherwise all separators are thousands separators ("1.234", "1,234")
	const lastSeparator = Math.max(numberPart.lastIndexOf(','), numberPart.lastIndexOf('.'));
	const decimals = lastSeparator === -1 ? '' : numberPart.slice(lastSeparator + 1);
	let normalized: string;
	if (lastSeparator !== -1 && decimals.length >= 1 && decimals.length <= 2) {
		const integer = numberPart.slice(0, lastSeparator).replace(/[.,]/g, '');
		normalized = `${integer || '0'}.${decimals}`;
	} else {
		normalized = numberPart.replace(/[.,]/g, '');
	}

	const amount = Number.parseFloat(normalized);
	return { amount: Number.isFinite(amount) ? amount : null, currency };
}

