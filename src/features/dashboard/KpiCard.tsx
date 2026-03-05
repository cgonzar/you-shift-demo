import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import type { KpiData } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

export function KpiCard({ kpi }: { kpi: KpiData }) {
	const isNegativeMetric = kpi.label === "Errors" || kpi.label === "Warnings";

	let trendColor = "text-muted-foreground";
	if (kpi.changeDirection !== "flat") {
		const isGood =
			(isNegativeMetric && kpi.changeDirection === "down") ||
			(!isNegativeMetric && kpi.changeDirection === "up");
		trendColor = isGood ? "text-green-600" : "text-red-600";
	}

	const TrendIcon = kpi.changeDirection === "up" ? "↑" : kpi.changeDirection === "down" ? "↓" : "→";

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="flex flex-col">
						<div className="text-2xl font-bold text-foreground">{kpi.value}</div>
						<p className={cn("mt-1 flex items-center text-xs", trendColor)}>
							<span className="mr-1">{TrendIcon}</span>
							{kpi.changePercent}%
						</p>
					</div>
					<Sparkline
						data={kpi.trend}
						width={80}
						height={32}
						className={trendColor}
						strokeWidth={2}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
