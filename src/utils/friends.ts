import type { FriendshipWithProfile, Profile } from '../types/friendship';

export function getProfilesFromFriendships(
	friendships: FriendshipWithProfile[],
	myId: string
): Profile[] {
	const profiles = friendships.map((friendship) => {
		const friend1 = friendship.friend_1;
		const friend2 = friendship.friend_2;

		if (friend1 && friend1.id !== myId) {
			return friend1;
		}
		if (friend2 && friend2.id !== myId) {
			return friend2;
		}
	});

	return profiles.filter((profile): profile is Profile => profile !== undefined);
}
