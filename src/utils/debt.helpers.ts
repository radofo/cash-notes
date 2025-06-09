import { noFriend } from '../stores/friends';
import type { DebtWithProfile } from '../types/debt';
import type { Profile } from '../types/friendship';
import { toFloat } from './currency';

export type DebtUpdateAction = 'updateDebt' | 'deleteDebt' | 'addDebt' | 'nothing';

export function debtOverview(debts: DebtWithProfile[]): {
	total: number;
	from: Profile;
	for: Profile;
} | null {
	const personA = debts[0]?.from;
	const personB = debts[0]?.for;
	const totalSettlement = // is the amount that personA gets from personB
		personA && personB
			? debts.reduce((sum, debt) => {
					if (debt.from_id === personA.id) {
						return sum + debt.amount;
					} else {
						return sum - debt.amount;
					}
			  }, 0)
			: 0;
	const settlementAmount = Math.abs(totalSettlement);

	if (!personA || !personB) return null;

	return {
		total: settlementAmount,
		from: totalSettlement > 0 ? personA : personB,
		for: totalSettlement > 0 ? personB : personA
	};
}

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
