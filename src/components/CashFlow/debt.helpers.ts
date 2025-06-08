import { noFriend } from '../../stores/friends';
import type { DebtWithProfile } from '../../types/debt';
import type { Profile } from '../../types/friendship';
import { toFloat } from '../../utils/currency';

export type DebtUpdateAction = 'updateDebt' | 'deleteDebt' | 'addDebt' | 'nothing';

export function getDebtAction(props: {
	currentDebt: DebtWithProfile | null;
	debtForm: {
		cfFriend: Profile | undefined;
		cfFriendAmount: string;
	};
}): DebtUpdateAction {
	const { currentDebt, debtForm } = props;
	if (currentDebt?.is_accepted === 'accepted') return 'nothing';

	const friendSelected = noFriend.id !== debtForm.cfFriend?.id;
	if (!currentDebt && friendSelected && debtForm.cfFriendAmount) {
		return 'addDebt';
	} else if (currentDebt && !friendSelected) {
		return 'deleteDebt';
	} else if (
		currentDebt &&
		friendSelected &&
		(toFloat(debtForm.cfFriendAmount) !== currentDebt.amount ||
			debtForm.cfFriend?.id !== currentDebt.for?.id)
	) {
		return 'updateDebt';
	}

	return 'nothing';
}
