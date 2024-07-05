<script lang="ts">
	import SumItem from './SumItem.svelte';
	import TotalItem from './TotalItem.svelte';
	import TotalSection from './TotalSection.svelte';

	let expenseOpen = false;
	let incomeOpen = false;
	let fixedCostsOpen = false;
	let budgetCostsOpen = false;
	let budgetsOpen = {
		abo: false,
		wohnen: false
	};
</script>

<div>
	<TotalSection bind:open={incomeOpen}>
		<div slot="title">Einnahmen</div>
		<span slot="total"> + 2200 $ </span>
		<div slot="content">
			<TotalItem>
				<span>Gehalt</span>
				<span>+ 2100 $</span>
			</TotalItem>
			<TotalItem>
				<span>Aktien</span>
				<span>+ 6.5 $</span>
			</TotalItem>
		</div>
	</TotalSection>
	<TotalSection bind:open={expenseOpen}>
		<div slot="title">Ausgaben</div>
		<span slot="total"> 2000 $ </span>
		<div slot="content">
			<TotalSection bind:open={fixedCostsOpen}>
				<div slot="title">Fixkosten</div>
				<span slot="total"> 1230 $ </span>
				<div slot="content">
					<TotalSection bind:open={budgetsOpen.abo}>
						<div slot="title">Abo</div>
						<span slot="total"> 123 $ </span>
						<div slot="content">
							<TotalItem>
								<span>Netflix</span>
								<span>6.5 $</span>
							</TotalItem>
							<TotalItem>
								<span>Youtube Music</span>
								<span>12 $</span>
							</TotalItem>
						</div>
					</TotalSection>
					<TotalSection bind:open={budgetsOpen.wohnen}>
						<div slot="title">Wohnen</div>
						<span slot="total"> 123 $ </span>
						<div slot="content">
							<TotalItem>
								<span>Miete</span>
								<span>909 $</span>
							</TotalItem>
							<TotalItem>
								<span>Strom</span>
								<span>90 $</span>
							</TotalItem>
						</div>
					</TotalSection>
				</div>
			</TotalSection>
			<TotalSection bind:open={budgetCostsOpen}>
				<div slot="title">Budgets</div>
				<span slot="total"> 850 $ </span>
				<div slot="content">
					<TotalSection bind:open={budgetsOpen.abo}>
						<div slot="title">Abo</div>
						<span slot="total"> 123 $ </span>
						<div slot="content">
							<TotalItem>
								<span>Netflix</span>
								<span>6.5 $</span>
							</TotalItem>
							<TotalItem>
								<span>Youtube Music</span>
								<span>12 $</span>
							</TotalItem>
						</div>
					</TotalSection>
					<TotalSection bind:open={budgetsOpen.wohnen}>
						<div slot="title">Wohnen</div>
						<span slot="total"> 123 $ </span>
						<div slot="content">
							<TotalItem>
								<span>Miete</span>
								<span>909 $</span>
							</TotalItem>
							<TotalItem>
								<span>Strom</span>
								<span>90 $</span>
							</TotalItem>
						</div>
					</TotalSection>
				</div>
			</TotalSection>
		</div>
	</TotalSection>
	<SumItem>
		<span>Überschuss</span>
		<span>+ 90 $</span>
	</SumItem>
</div>
