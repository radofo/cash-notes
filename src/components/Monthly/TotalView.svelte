<script lang="ts">
	import { Pen } from 'lucide-svelte';
	import TotalTable from '../Total/TotalTable.svelte';
</script>

<div class="flex w-full flex-col gap-10">
	<div class="flex flex-row items-center justify-between">
		<span class="block text-center text-2xl font-medium">Monatlich</span>
		<a href="/budgets/edit" class="">
			<Pen class="cursor-pointer" size={18} />
		</a>
	</div>
	<TotalTable />
</div>
