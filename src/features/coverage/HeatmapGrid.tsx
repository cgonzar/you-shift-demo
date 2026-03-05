import { Fragment } from "react";
import { Card } from "@/components/ui/card";
import { cellKey, DAYS, SHIFT_LABELS, SHIFTS } from "@/features/scheduler/domain";
import type { StaffingLevel } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import { STAFFING_CLASSES } from "./coverage-domain";

interface HeatmapGridProps {
	matrix: StaffingLevel[];
}

export function HeatmapGrid({ matrix }: HeatmapGridProps) {
	// Create a lookup map for faster access
	const matrixMap = new Map<string, StaffingLevel>();
	for (const level of matrix) {
		matrixMap.set(cellKey(level.day, level.shift), level);
	}

	return (
		<Card className="overflow-x-auto p-4">
			<div className="grid min-w-[600px] grid-cols-[auto_repeat(7,1fr)] gap-1.5">
				{/* Header Row */}
				<div className="h-8" /> {/* Empty top-left cell */}
				{DAYS.map((day) => (
					<div
						key={day}
						className="flex h-8 items-center justify-center text-xs font-medium tracking-wider text-muted-foreground uppercase"
					>
						{day}
					</div>
				))}
				{/* Data Rows */}
				{SHIFTS.map((shift) => (
					<Fragment key={shift}>
						{/* Row Label */}
						<div className="flex h-12 items-center pr-4 text-sm font-medium whitespace-nowrap text-muted-foreground">
							{SHIFT_LABELS[shift]}
						</div>

						{/* Day Cells */}
						{DAYS.map((day) => {
							const key = cellKey(day, shift);
							const data = matrixMap.get(key);

							// Default fallback if data is missing (shouldn't happen with valid seed data)
							const status = data?.status ?? "ok";
							const label = data ? `${data.assigned}/${data.required}` : "-";

							return (
								<div
									key={key}
									className={cn(
										"flex h-12 items-center justify-center rounded-md text-sm font-semibold transition-colors",
										STAFFING_CLASSES[status]
									)}
									title={`${day} ${shift}: ${data?.status}`}
								>
									{label}
								</div>
							);
						})}
					</Fragment>
				))}
			</div>
		</Card>
	);
}
