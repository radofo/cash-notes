import type { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type { DebtInsert, DebtUpdate, DebtWithProfile } from '../types/debt';

/**
 * Insert a new debt record
 * @param dto The debt data to insert
 * @param fromId The ID of the user creating the debt (who owes)
 * @param forId The ID of the user who is owed
 * @param supabase The Supabase client
 * @returns The created debt with profile information
 */
export async function insertDebtSupabase(
	dto: DebtInsert,
	supabase: SupabaseClient
): Promise<DebtWithProfile> {
	const { data } = await supabase.from('debt').insert([
		{
			...dto,
			from_id: dto.from_id,
			for_id: dto.for_id,
			is_accepted: dto.is_accepted ?? 'pending'
		}
	]).select(`
      *,
      from:from_id(*),
      for:for_id(*)
    `);

	return data?.[0];
}

/**
 * Get debt by ID with profile information
 * @param id The debt ID
 * @param supabase The Supabase client
 * @returns The debt with profile information
 */
export async function getDebtById(
	id: string,
	supabase: SupabaseClient
): Promise<DebtWithProfile | null> {
	const { data } = await supabase
		.from('debt')
		.select(
			`
      *,
      from:from_id(*),
      for:for_id(*)
    `
		)
		.eq('id', id)
		.single();

	return data;
}

/**
 * Get all debts for a user (both as creator and recipient)
 * @param userId The user ID
 * @param supabase The Supabase client
 * @returns List of debts with profile information
 */
export async function getDebtsByUserId(
	userId: string,
	supabase: SupabaseClient
): Promise<DebtWithProfile[]> {
	const { data } = await supabase
		.from('debt')
		.select(
			`
		*,
		from:from_id(*),
		for:for_id(*)
	`
		)
		.or(`from_id.eq.${userId},for_id.eq.${userId}`)
		.is('settlement_id', null)
		.order('date', { ascending: false });

	// Parse receipt field if it's a string
	return (data ?? []).map((debt) => ({
		...debt,
		receipt: typeof debt.receipt === 'string' ? JSON.parse(debt.receipt) : debt.receipt
	}));
}

export async function reactToDebt(
	currentDebt: DebtWithProfile,
	reaction: 'accepted' | 'rejected',
	currentUserId: string,
	supabase: SupabaseClient
): Promise<DebtWithProfile | null> {
	if (currentDebt.is_accepted === 'accepted') {
		return null;
	}
	if (currentUserId !== currentDebt.for_id) {
		return null;
	}
	if (reaction !== 'accepted' && reaction !== 'rejected') {
		return null;
	}

	const { data } = await supabase
		.from('debt')
		.update({
			id: currentDebt.id,
			is_accepted: reaction
		})
		.eq('id', currentDebt.id).select(`
			*,
			from:from_id(*),
			for:for_id(*)
		`);

	return data?.[0];
}

export async function updateDebtSupabase(
	currentDebt: DebtWithProfile,
	dto: DebtUpdate,
	currentUserId: string,
	supabase: SupabaseClient
): Promise<DebtWithProfile | null> {
	// Only allowed for pending debts
	if (!['pending', 'rejected'].includes(currentDebt.is_accepted)) {
		return null;
	}

	// Verify the user is the debtor (from_id user)
	if (currentUserId !== currentDebt.from_id) {
		return null;
	}

	const updateData: DebtUpdate = {
		id: currentDebt.id,
		is_accepted: 'pending' // Automatically set back to pending
	};

	// Debtor can update amount, name, and date
	if (dto.amount !== undefined) {
		updateData.amount = dto.amount;
	}
	if (dto.name !== undefined) {
		updateData.name = dto.name;
	}
	if (dto.date !== undefined) {
		updateData.date = dto.date;
	}
	if (dto.for_id !== undefined) {
		updateData.for_id = dto.for_id;
	}

	// Ignore any attempts to change the is_accepted field
	// The approved status cannot be changed here

	// If there's nothing to update, return the current debt
	if (Object.keys(updateData).length <= 2) {
		return getDebtById(currentDebt.id, supabase);
	}

	const { data } = await supabase.from('debt').update(updateData).eq('id', currentDebt.id).select(`
			*,
			from:from_id(*),
			for:for_id(*)
		`);

	return data?.[0];
}

/**
 * Delete a debt by ID
 * @param id The debt ID to delete
 * @param supabase The Supabase client
 * @returns True if deletion was successful
 */
export async function deleteDebtSupabase(id: string, supabase: SupabaseClient): Promise<boolean> {
	const res = await supabase.from('debt').delete().eq('id', id);
	return res.status === 204;
}

export async function settleDebt(
	debts: DebtWithProfile[],
	supabase: SupabaseClient
): Promise<boolean> {
	// Check if all debts are accepted
	const allAccepted = debts.every((debt) => debt.is_accepted === 'accepted');

	if (!allAccepted) {
		return false;
	}

	// Generate a settlement ID
	const settlementId = uuidv4();

	// Update all debts with the settlement ID
	const promises = debts.map((debt) =>
		supabase.from('debt').update({ settlement_id: settlementId }).eq('id', debt.id)
	);

	try {
		// Execute all updates
		await Promise.all(promises);
		return true;
	} catch (error) {
		console.error('Error settling debts:', error);
		return false;
	}
}

/**
 * Get settled debts grouped by settlement_id with complete groups
 * @param userId The user ID
 * @param supabase The Supabase client
 * @param initialLimit Number of debts to fetch initially (default 50)
 * @returns Map of settlement_id to array of debts, with complete groups ordered by most recent
 */
export async function getSettledDebtsGrouped(
	userId: string,
	supabase: SupabaseClient,
	initialLimit = 50
): Promise<Map<string, DebtWithProfile[]>> {
	// Step 1: Fetch first N settled debts (ordered by created_at descending)
	const { data: initialDebts } = await supabase
		.from('debt')
		.select(
			`
		*,
		from:from_id(*),
		for:for_id(*)
	`
		)
		.or(`from_id.eq.${userId},for_id.eq.${userId}`)
		.not('settlement_id', 'is', null)
		.order('created_at', { ascending: false })
		.limit(initialLimit);

	if (!initialDebts || initialDebts.length === 0) {
		return new Map();
	}

	// Step 2: Group debts by settlement_id in order of appearance
	const grouped = new Map<string, DebtWithProfile[]>();
	const settlementOrder: string[] = [];

	for (const debt of initialDebts) {
		if (debt.settlement_id) {
			if (!grouped.has(debt.settlement_id)) {
				grouped.set(debt.settlement_id, []);
				settlementOrder.push(debt.settlement_id);
			}
			const group = grouped.get(debt.settlement_id);
			if (group) {
				group.push(debt);
			}
		}
	}

	// Step 3: Get the last (oldest) settlement_id to check if it's complete
	if (settlementOrder.length > 0 && initialDebts.length === initialLimit) {
		const lastSettlementId = settlementOrder[settlementOrder.length - 1];

		// Fetch all debts for the last settlement_id to ensure we have the complete group
		const { data: remainingDebts } = await supabase
			.from('debt')
			.select(
				`
			*,
			from:from_id(*),
			for:for_id(*)
		`
			)
			.or(`from_id.eq.${userId},for_id.eq.${userId}`)
			.eq('settlement_id', lastSettlementId);

		if (remainingDebts) {
			// Replace the potentially incomplete group with the complete one
			grouped.set(lastSettlementId, remainingDebts);
		}
	}

	// Step 4: Sort debts within each group by date descending
	for (const [, groupDebts] of grouped) {
		groupDebts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}

	// Return groups in the correct order (as they appeared in settlementOrder)
	const orderedGrouped = new Map<string, DebtWithProfile[]>();
	for (const settlementId of settlementOrder) {
		const group = grouped.get(settlementId);
		if (group) {
			orderedGrouped.set(settlementId, group);
		}
	}

	return orderedGrouped;
}
