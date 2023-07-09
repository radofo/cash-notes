import { supabase } from './supabaseClient';
import type { InsertCashGroupDTO } from './supabaseTypes';

export async function getSupabaseUser() {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	return user;
}

export async function loginUser(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	return { data, error };
}

export async function logoutUser() {
	const { error } = await supabase.auth.signOut();

	return error;
}

export async function insertCashGroup(dto: InsertCashGroupDTO) {
	const { data, error } = await supabase.from('cash_group').insert([dto]).select();
	console.log('error:', error);
	console.log('data:', data);
}
