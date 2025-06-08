// Profile
export type Profile = {
	id: string;
	createdAt: string;
	full_name: string;
	profile_image: string | null;
};

// Friendship
type FriendshipBase = {
	id: string;
	createdAt: string;
};
export type FriendshipWithFlat = FriendshipBase & {
	friend_1: string;
	friend_2: string;
};
export type FriendshipWithProfile = FriendshipBase & {
	friend_1: Profile | null;
	friend_2: Profile | null;
};
