import type { SupabaseClient } from '@supabase/supabase-js';
import type { FriendshipWithProfile } from '../types/friendship';

/**
 * Gets all friendships for the current user with resolved profile information
 * @param supabase Supabase client instance
 * @returns Promise with an array of friendships including profile information
 */
export async function getFriendships(supabase: SupabaseClient): Promise<FriendshipWithProfile[]> {
	const { data: user } = await supabase.auth.getUser();
	const userId = user?.user?.id;

	if (!userId) {
		return [];
	}

	// Get all friendships where the current user is either friend_1 or friend_2
	const { data: friendships, error } = await supabase
		.from('friendship')
		.select(
			`
      id,
      created_at,
      friend_1:friend_1(*),
      friend_2:friend_2(*)
    `
		)
		.or(`friend_1.eq.${userId},friend_2.eq.${userId}`);

	if (error || !friendships) {
		console.error('Error fetching friendships:', error);
		return [];
	}

	// Need to cast the response to match our expected type structure
	return friendships as unknown as FriendshipWithProfile[];
}
