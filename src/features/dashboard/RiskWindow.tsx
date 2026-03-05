import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DAY_LABELS, SHIFT_LABELS } from "@/features/scheduler/domain";
import type { RiskWindow } from "@/lib/seed-data";

export function RiskWindowCard({ risk }: { risk: RiskWindow }) {
	const isHigh = risk.severity === "high";

	return (
		<Link to="/coverage">
			<Card className="cursor-pointer transition-colors hover:border-foreground/20">
				<CardContent className="flex flex-col gap-2 p-4">
					<div className="flex items-center gap-2">
						<Badge variant={isHigh ? "destructive" : "secondary"}>
							{DAY_LABELS[risk.day]} {SHIFT_LABELS[risk.shift]}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">{risk.reason}</p>
				</CardContent>
			</Card>
		</Link>
	);
}
