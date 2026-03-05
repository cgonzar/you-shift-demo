import type { CellKey, Day, Employee, Issue, Schedule, Shift } from "@/features/scheduler/domain";
import {
	cellKey,
	DAY_LABELS,
	DAYS,
	SHIFT_LABELS,
	SHIFTS,
	validateSchedule,
} from "@/features/scheduler/domain";

// ─── Seed schedule ────────────────────────────────────────────────────────────
// Deterministic pre-filled schedule that produces a mix of errors and warnings.

const SEED_ASSIGNMENTS: Array<[Day, Shift, Employee]> = [
	["Mon", "Morning", "Alice"],
	["Mon", "Afternoon", "Bob"],
	["Mon", "Night", "Carol"],
	["Tue", "Morning", "Dan"],
	["Tue", "Afternoon", "Alice"],
	["Tue", "Night", "Bob"],
	["Wed", "Morning", "Carol"],
	["Wed", "Afternoon", "Dan"],
	["Wed", "Night", "Alice"],
	["Thu", "Morning", "Bob"],
	["Thu", "Afternoon", "Carol"],
	["Thu", "Night", "Dan"],
	["Fri", "Morning", "Alice"],
	["Fri", "Afternoon", "Bob"],
	["Fri", "Night", "Carol"],
	// Weekend — intentionally sparse to trigger weekend-coverage warnings
	["Sat", "Morning", "Dan"],
	["Sat", "Night", "Dan"],
	// Sunday — Alice does all 3 (triggers alone-all-day + double-booking)
	["Sun", "Morning", "Alice"],
	["Sun", "Afternoon", "Alice"],
	["Sun", "Night", "Alice"],
];

function buildSeedSchedule(): Schedule {
	const schedule: Partial<Schedule> = {};
	for (const day of DAYS) {
		for (const shift of SHIFTS) {
			schedule[cellKey(day, shift)] = null;
		}
	}
	for (const [day, shift, employee] of SEED_ASSIGNMENTS) {
		schedule[cellKey(day, shift)] = employee;
	}
	return schedule as Schedule;
}

export interface StaffingLevel {
	day: Day;
	shift: Shift;
	assigned: number;
	required: number;
	status: "understaffed" | "ok" | "overstaffed";
}

export interface KpiData {
	label: string;
	value: string;
	trend: number[];
	changePercent: number;
	changeDirection: "up" | "down" | "flat";
}

export interface RiskWindow {
	id: string;
	day: Day;
	shift: Shift;
	reason: string;
	severity: "high" | "medium";
	cellKey: CellKey;
}

export interface DemoModel {
	schedule: Schedule;
	issues: Issue[];
	kpis: KpiData[];
	coverageMatrix: StaffingLevel[];
	riskWindows: RiskWindow[];
}

const REQUIRED_PER_SHIFT: Record<Shift, number> = {
	Morning: 1,
	Afternoon: 1,
	Night: 1,
};

function buildCoverageMatrix(schedule: Schedule): StaffingLevel[] {
	return DAYS.flatMap((day) =>
		SHIFTS.map((shift): StaffingLevel => {
			const key = cellKey(day, shift);
			const assigned = schedule[key] !== null ? 1 : 0;
			const required = REQUIRED_PER_SHIFT[shift];
			let status: StaffingLevel["status"] = "ok";
			if (assigned < required) status = "understaffed";
			if (assigned > required) status = "overstaffed";
			return { day, shift, assigned, required, status };
		})
	);
}

function buildKpis(schedule: Schedule, issues: Issue[]): KpiData[] {
	const totalSlots = DAYS.length * SHIFTS.length;
	const filledSlots = Object.values(schedule).filter((v) => v !== null).length;
	const coveragePct = Math.round((filledSlots / totalSlots) * 100);
	const errorCount = issues.filter((i) => i.severity === "error").length;
	const warningCount = issues.filter((i) => i.severity === "warning").length;

	return [
		{
			label: "Shifts Filled",
			value: `${filledSlots} / ${totalSlots}`,
			trend: [12, 14, 13, 16, 15, 18, filledSlots],
			changePercent: 8,
			changeDirection: "up",
		},
		{
			label: "Coverage",
			value: `${coveragePct}%`,
			trend: [65, 70, 68, 75, 72, 80, coveragePct],
			changePercent: 5,
			changeDirection: "up",
		},
		{
			label: "Errors",
			value: String(errorCount),
			trend: [5, 4, 6, 3, 4, 2, errorCount],
			changePercent: errorCount > 2 ? 15 : 10,
			changeDirection: errorCount > 2 ? "up" : "down",
		},
		{
			label: "Warnings",
			value: String(warningCount),
			trend: [8, 7, 9, 6, 8, 5, warningCount],
			changePercent: warningCount > 5 ? 12 : 8,
			changeDirection: warningCount > 5 ? "up" : "down",
		},
	];
}

function isWeekend(day: Day): boolean {
	return day === "Sat" || day === "Sun";
}

function unassignedRisks(schedule: Schedule, issues: Issue[]): RiskWindow[] {
	return DAYS.flatMap((day) =>
		SHIFTS.filter((shift) => schedule[cellKey(day, shift)] === null).map((shift): RiskWindow => {
			const key = cellKey(day, shift);
			const relatedIssue = issues.find((i) => i.cells.includes(key));
			return {
				id: `risk-${key}`,
				day,
				shift,
				reason: relatedIssue
					? relatedIssue.title
					: `${DAY_LABELS[day]} ${SHIFT_LABELS[shift]} is unassigned`,
				severity: isWeekend(day) ? "high" : "medium",
				cellKey: key,
			};
		})
	);
}

function errorIssueRisks(issues: Issue[], existing: RiskWindow[]): RiskWindow[] {
	const existingIds = new Set(existing.map((r) => r.id));
	return issues
		.filter((issue) => issue.severity === "error" && issue.cells[0])
		.filter((issue) => !existingIds.has(`risk-error-${issue.id}`))
		.map((issue): RiskWindow => {
			const firstCell = issue.cells[0];
			const [day, shift] = firstCell.split("-") as [Day, Shift];
			return {
				id: `risk-error-${issue.id}`,
				day,
				shift,
				reason: issue.title,
				severity: "high",
				cellKey: firstCell,
			};
		});
}

function buildRiskWindows(schedule: Schedule, issues: Issue[]): RiskWindow[] {
	const fromUnassigned = unassignedRisks(schedule, issues);
	const fromErrors = errorIssueRisks(issues, fromUnassigned);
	return [...fromUnassigned, ...fromErrors].slice(0, 5);
}

function createDemoModel(): DemoModel {
	const schedule = buildSeedSchedule();
	const issues = validateSchedule(schedule);
	const kpis = buildKpis(schedule, issues);
	const coverageMatrix = buildCoverageMatrix(schedule);
	const riskWindows = buildRiskWindows(schedule, issues);
	return { schedule, issues, kpis, coverageMatrix, riskWindows };
}

export const DEMO_MODEL: DemoModel = createDemoModel();

export function selectKpis(): KpiData[] {
	return DEMO_MODEL.kpis;
}

export function selectCoverageMatrix(): StaffingLevel[] {
	return DEMO_MODEL.coverageMatrix;
}

export function selectIssues(): Issue[] {
	return DEMO_MODEL.issues;
}

export function selectIssueById(id: string): Issue | undefined {
	return DEMO_MODEL.issues.find((i) => i.id === id);
}

export function selectRiskWindows(): RiskWindow[] {
	return DEMO_MODEL.riskWindows;
}
