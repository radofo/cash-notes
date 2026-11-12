import { json, type RequestEvent } from '@sveltejs/kit';
import { parseTransactionAmount } from '../../../utils/currency';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Called by the iOS Shortcuts "Transaction" automation.
 * Body: { merchant, amount, date } with `Authorization: Bearer <api token>`.
 * The request carries no session, so `locals.supabase` acts as the anon role and
 * create_suggestion() resolves the owner from the token.
 */
export const POST = async ({ request, locals: { supabase } }: RequestEvent) => {
	const token = request.headers
		.get('authorization')
		?.replace(/^Bearer\s+/i, '')
		.trim();

	if (!token) {
		return json({ error: 'Missing API token' }, { status: 401 });
	}

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { amount, currency } = parseTransactionAmount(body.amount);
	const merchant = typeof body.merchant === 'string' ? body.merchant : null;
	const date = typeof body.date === 'string' && DATE_PATTERN.test(body.date) ? body.date : null;

	const { data, error } = await supabase.rpc('create_suggestion', {
		p_token: token,
		p_name: merchant,
		p_amount: amount,
		p_date: date,
		p_currency: currency
	});

	if (error) {
		if (error.code === '28000') {
			return json({ error: 'Invalid API token' }, { status: 401 });
		}
		console.error('Error creating suggestion:', error);
		return json({ error: 'Failed to create suggestion' }, { status: 500 });
	}

	return json({ id: data });
};
