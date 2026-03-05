import { KpiCard } from "@/features/dashboard/KpiCard";
import { RiskWindowCard } from "@/features/dashboard/RiskWindow";
import { selectKpis, selectRiskWindows } from "@/lib/seed-data";

export function DashboardPage() {
	const kpis = selectKpis();
	const risks = selectRiskWindows();

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">Overview of scheduling health</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{kpis.map((kpi) => (
					<KpiCard key={kpi.label} kpi={kpi} />
				))}
			</div>

			<div>
				<h2 className="mt-8 mb-4 text-lg font-semibold">Top Risk Windows</h2>
				{risks.length > 0 ? (
					<div className="flex flex-col gap-3">
						{risks.map((risk) => (
							<RiskWindowCard key={risk.id} risk={risk} />
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">No risk windows detected</p>
				)}
			</div>
		</div>
	);
}
