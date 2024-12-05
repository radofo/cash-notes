<script lang="ts">
	import { Pen } from 'lucide-svelte';
	import TotalTable from '../Total/TotalTable.svelte';
</script>

<div class="flex w-full flex-col gap-8">
	<div class="flex flex-row items-center justify-between">
		<span class="text-md block text-start font-bold">Geplante monatliche Zahlungen</span>
		<a href="/budgets/edit">
			<Pen class="cursor-pointer" size={18} />
		</a>
	</div>
	<TotalTable />
</div>
