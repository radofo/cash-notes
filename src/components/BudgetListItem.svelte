<script lang="ts">
	import type { CashGroup, CashGroupUpdate } from '../types/supabase';
	import { IconX, IconPencil } from '@tabler/icons-svelte';
	import BudgetListItemEdit from './BudgetListItemEdit.svelte';

	export let cashGroup: CashGroup;
	export let deleteCashGroup: (id: string) => Promise<void>;
	export let updateCashGroup: (dto: CashGroupUpdate) => void;
	export let setIsEditing: (isEditing: string) => void;
	export let isEditing: boolean;
</script>

{#if isEditing}
	<BudgetListItemEdit cashGroupToBeUpdated={cashGroup} {updateCashGroup} />
{:else}
	<li class="flex w-full items-center justify-between gap-40 border-b p-3 last:border-0">
		<span class="border border-white border-opacity-0 pb-2 pt-2 text-lg">{cashGroup?.name}</span>
		<div class="flex items-center">
			<span class="pr-3 text-lg">{cashGroup?.budget}€</span>
			<div class="flex gap-1 border-l pl-3">
				<button
					on:click={async () => {
						setIsEditing(cashGroup.id);
					}}
				>
					<IconPencil class="text-slate-900 hover:cursor-pointer hover:text-blue-800" />
				</button>
				<button
					on:click={async () => {
						await deleteCashGroup(cashGroup.id);
					}}
				>
					<IconX class="hover:text-red-800" />
				</button>
			</div>
		</div>
	</li>
{/if}
