import { writable } from 'svelte/store';
import type { Profile } from '../types/friendship';

export const friendsStore = writable<Profile[]>([]);
export const noFriend: Profile = {
	id: 'nofriend',
	full_name: '-',
	createdAt: '',
	profile_image: null
};
