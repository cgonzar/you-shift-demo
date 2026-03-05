import { useMemo, useState } from "react";
import type { CellKey, Employee, Severity, Issue } from "@/features/scheduler/domain";
import { createEmptySchedule, validateSchedule, EMPLOYEES } from "@/features/scheduler/domain";
import { IssuesPanel } from "@/features/scheduler/IssuesPanel";
import { ShiftGrid, DraggableEmployee } from "@/features/scheduler/ShiftGrid";
import { StatusHeader } from "@/features/scheduler/StatusHeader";
import { DEMO_MODEL } from "@/lib/seed-data";

export function SchedulePage() {
	const [schedule, setSchedule] = useState(DEMO_MODEL.schedule);
	const [activeIssueId, setActiveIssueId] = useState<string | null>(null);

	const issues = useMemo(() => validateSchedule(schedule), [schedule]);

	const activeIssue = useMemo(
		() => issues.find((i) => i.id === activeIssueId) ?? null,
		[issues, activeIssueId]
	);

	const highlightedCells = useMemo(() => new Set<CellKey>(activeIssue?.cells ?? []), [activeIssue]);

	const activeIssueSeverity: Severity | null = activeIssue?.severity ?? null;

	const handleAssign = useMemo(
		() => (key: CellKey, employee: Employee | null) => {
			setSchedule((prev) => ({ ...prev, [key]: employee }));
			setActiveIssueId(null);
		},
		[]
	);

	const handleReset = useMemo(
		() => () => {
			setSchedule(createEmptySchedule());
			setActiveIssueId(null);
		},
		[]
	);

	const handleQuickFix = useMemo(
		() => (issue: Issue) => {
			setSchedule((prev) => {
				const next = { ...prev };
				issue.cells.forEach((cell) => {
					next[cell] = null;
				});
				return next;
			});
			setActiveIssueId(null);
		},
		[]
	);

	return (
		<>
			<div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-3xl font-semibold tracking-tighter text-foreground">
							Shift Builder
						</h1>
						<span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
							Beta
						</span>
					</div>
					<p className="mt-2 max-w-2xl text-base text-muted-foreground">
						Drag and drop employees to assign shifts. Constraints are checked in real-time.
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-8">
				<div className="flex gap-2">
					<div className="align-center flex w-full flex-col gap-2">
						<span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
							Available Team
						</span>
						<div className="flex h-20 flex-wrap items-center gap-3 rounded-2xl border border-border/50 bg-muted/20 p-3">
							{EMPLOYEES.map((emp) => (
								<DraggableEmployee key={emp} employee={emp} />
							))}
						</div>
					</div>
					<StatusHeader issues={issues} onReset={handleReset} />
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
					<ShiftGrid
						schedule={schedule}
						highlightedCells={highlightedCells}
						activeIssueSeverity={activeIssueSeverity}
						onAssign={handleAssign}
					/>

					<aside className="flex flex-col">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-base font-medium text-foreground">Issues</h2>
							{issues.length > 0 && (
								<span className="flex h-5 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-foreground">
									{issues.length}
								</span>
							)}
						</div>
						<IssuesPanel
							issues={issues}
							activeIssueId={activeIssueId}
							onSelectIssue={setActiveIssueId}
							onQuickFix={handleQuickFix}
						/>
					</aside>
				</div>
			</div>
		</>
	);
}
