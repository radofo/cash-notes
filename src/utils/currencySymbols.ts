/**
 * Maps currency symbols (as they appear in localized amount strings, without trailing dots)
 * to ISO 4217 codes. Covers Europe, North America, Japan, China and South Korea.
 *
 * Ambiguous symbols are deliberately left out, so they resolve to null and the user
 * picks the currency when approving:
 * - "kr" (SEK, NOK, DKK, ISK)
 * - "L" (ALL, MDL)
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
	// Euro
	'€': 'EUR',

	// Rest of Europe
	'£': 'GBP',
	'UK£': 'GBP',
	CHF: 'CHF',
	Fr: 'CHF',
	fr: 'CHF',
	SFr: 'CHF',
	'zł': 'PLN',
	'Kč': 'CZK',
	Ft: 'HUF',
	lei: 'RON',
	'лв': 'BGN',
	'дин': 'RSD',
	din: 'RSD',
	KM: 'BAM',
	'ден': 'MKD',
	Lek: 'ALL',
	'₴': 'UAH',
	'грн': 'UAH',
	Br: 'BYN',
	'₽': 'RUB',
	'руб': 'RUB',
	'₺': 'TRY',
	TL: 'TRY',
	'₾': 'GEL',
	'֏': 'AMD',
	'₼': 'AZN',

	// North America
	$: 'USD',
	US$: 'USD',
	CA$: 'CAD',
	C$: 'CAD',
	MX$: 'MXN',
	Mex$: 'MXN',

	// Japan
	'¥': 'JPY',
	'JP¥': 'JPY',
	'円': 'JPY',

	// China
	'CN¥': 'CNY',
	'元': 'CNY',
	RMB: 'CNY',

	// South Korea
	'₩': 'KRW',
	'원': 'KRW'
};

/** Resolves a symbol or ISO code (e.g. "€", "CA$", "USD") to an ISO 4217 code, or null. */
export function currencyFromSymbol(raw: string): string | null {
	const symbol = raw.trim().replace(/\.+$/, '');
	if (!symbol) return null;
	if (CURRENCY_SYMBOLS[symbol]) return CURRENCY_SYMBOLS[symbol];
	return /^[A-Z]{3}$/.test(symbol) ? symbol : null;
}
