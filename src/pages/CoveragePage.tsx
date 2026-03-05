import { STAFFING_CLASSES, STAFFING_LABELS } from "@/features/coverage/coverage-domain";
import { HeatmapGrid } from "@/features/coverage/HeatmapGrid";
import { selectCoverageMatrix } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

export function CoveragePage() {
	const matrix = selectCoverageMatrix();
	const legendItems = ["understaffed", "ok", "overstaffed"] as const;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-foreground">Coverage Heatmap</h1>
				<p className="text-muted-foreground">Staffing levels across the week</p>
			</div>

			<HeatmapGrid matrix={matrix} />

			<div className="flex flex-wrap items-center gap-6">
				{legendItems.map((status) => (
					<div key={status} className="flex items-center gap-2">
						<span
							className={cn(
								"h-3 w-3 rounded-full ring-1 ring-black/10 ring-inset dark:ring-white/20",
								STAFFING_CLASSES[status].split(" ")[0] // Extract bg color only
							)}
							aria-hidden="true"
						/>
						<span className="text-sm font-medium text-muted-foreground">
							{STAFFING_LABELS[status]}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
