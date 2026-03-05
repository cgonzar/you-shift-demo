// ─── Primitive types ──────────────────────────────────────────────────────────

export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type Shift = "Morning" | "Afternoon" | "Night";
export type Employee = "Alice" | "Bob" | "Carol" | "Dan";

/** Composite key that uniquely identifies one cell in the grid. */
export type CellKey = `${Day}-${Shift}`;

/** The full weekly schedule: every cell mapped to an employee or null. */
export type Schedule = Record<CellKey, Employee | null>;

export type Severity = "error" | "warning";

export interface Issue {
	id: string;
	severity: Severity;
	title: string;
	description: string;
	/** Grid cells implicated by this issue — used to highlight them. */
	cells: CellKey[];
	explanation: string;
	fix: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

export const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const SHIFTS: Shift[] = ["Morning", "Afternoon", "Night"];
export const EMPLOYEES: Employee[] = ["Alice", "Bob", "Carol", "Dan"];

export const DAY_LABELS: Record<Day, string> = {
	Mon: "Monday",
	Tue: "Tuesday",
	Wed: "Wednesday",
	Thu: "Thursday",
	Fri: "Friday",
	Sat: "Saturday",
	Sun: "Sunday",
};

export const SHIFT_LABELS: Record<Shift, string> = {
	Morning: "Morning",
	Afternoon: "Afternoon",
	Night: "Night",
};

// ─── Schedule helpers ─────────────────────────────────────────────────────────

export function cellKey(day: Day, shift: Shift): CellKey {
	return `${day}-${shift}`;
}

export function createEmptySchedule(): Schedule {
	const entries = DAYS.flatMap((day) =>
		SHIFTS.map((shift): [CellKey, null] => [cellKey(day, shift), null])
	);
	return Object.fromEntries(entries) as Schedule;
}

/** All (shift, employee) assignments for a given day — filters out nulls. */
export function getAssignmentsForDay(
	schedule: Schedule,
	day: Day
): Array<{ shift: Shift; employee: Employee }> {
	return SHIFTS.flatMap((shift) => {
		const employee = schedule[cellKey(day, shift)];
		return employee ? [{ shift, employee }] : [];
	});
}

/** All (day, shift) assignments for a given employee — filters out nulls. */
export function getAssignmentsForEmployee(
	schedule: Schedule,
	employee: Employee
): Array<{ day: Day; shift: Shift }> {
	return DAYS.flatMap((day) =>
		SHIFTS.flatMap((shift) => {
			const assigned = schedule[cellKey(day, shift)];
			return assigned === employee ? [{ day, shift }] : [];
		})
	);
}

// ─── Constraint rules ─────────────────────────────────────────────────────────
// Each rule is a pure function: (schedule) => Issue[]
// Adding a new rule = write the function + add it to RULES below.

type ConstraintRule = (schedule: Schedule) => Issue[];

/**
 * ERROR — Same employee assigned to 2+ shifts on the same day.
 * No human can be in two places at once.
 */
const checkDoubleBooking: ConstraintRule = (schedule) => {
	const issues: Issue[] = [];

	for (const day of DAYS) {
		const assignments = getAssignmentsForDay(schedule, day);

		// Group shifts by employee
		const byEmployee: Record<string, Shift[]> = {};
		for (const { shift, employee } of assignments) {
			if (byEmployee[employee] === undefined) {
				byEmployee[employee] = [];
			}
			byEmployee[employee].push(shift);
		}

		for (const [employee, shifts] of Object.entries(byEmployee)) {
			if (shifts.length >= 2) {
				const cells = shifts.map((s) => cellKey(day, s as Shift));
				issues.push({
					id: `double-booking-${day}-${employee}`,
					severity: "error",
					title: `${employee} double-booked on ${day}`,
					description: `Assigned to ${shifts.join(" and ")} on ${DAY_LABELS[day]}`,
					cells,
					explanation: `${employee} is assigned to ${shifts.length} shifts on ${DAY_LABELS[day]} (${shifts.join(", ")}). A single employee cannot work overlapping shifts.`,
					fix: `Remove ${employee} from at least one of their ${DAY_LABELS[day]} shifts and assign another employee, or leave it unassigned.`,
				});
			}
		}
	}

	return issues;
};

/**
 * ERROR — Employee works Night then Morning the very next day (< 8h rest).
 * Night ends ~06:00, Morning starts ~06:00 → zero rest between days.
 */
const checkNightThenMorning: ConstraintRule = (schedule) => {
	const issues: Issue[] = [];

	for (let i = 0; i < DAYS.length - 1; i++) {
		const today = DAYS[i];
		const tomorrow = DAYS[i + 1];

		const tonightEmployee = schedule[cellKey(today, "Night")];
		const tomorrowMorningEmployee = schedule[cellKey(tomorrow, "Morning")];

		if (
			tonightEmployee !== null &&
			tomorrowMorningEmployee !== null &&
			tonightEmployee === tomorrowMorningEmployee
		) {
			issues.push({
				id: `night-then-morning-${today}-${tomorrow}-${tonightEmployee}`,
				severity: "error",
				title: `${tonightEmployee} has no rest between ${today} Night → ${tomorrow} Morning`,
				description: `Works Night on ${today} then Morning on ${tomorrow} — less than 8 hours rest`,
				cells: [cellKey(today, "Night"), cellKey(tomorrow, "Morning")],
				explanation: `${tonightEmployee} is assigned to the ${DAY_LABELS[today]} Night shift immediately followed by the ${DAY_LABELS[tomorrow]} Morning shift. Night shifts typically end at 06:00 and Morning shifts begin at 06:00, leaving zero recovery time.`,
				fix: `Replace ${tonightEmployee} on either the ${DAY_LABELS[today]} Night shift or the ${DAY_LABELS[tomorrow]} Morning shift with a different employee.`,
			});
		}
	}

	return issues;
};

/**
 * WARNING — Employee assigned more than 5 shifts in the week.
 * Industry standard is ≤ 5 shifts per 7-day period.
 */
const checkMaxShiftsPerWeek: ConstraintRule = (schedule) => {
	const MAX_SHIFTS = 5;

	return EMPLOYEES.flatMap((employee) => {
		const assignments = getAssignmentsForEmployee(schedule, employee);
		if (assignments.length <= MAX_SHIFTS) return [];

		const cells = assignments.map(({ day, shift }) => cellKey(day, shift));
		return [
			{
				id: `max-shifts-${employee}`,
				severity: "warning" as Severity,
				title: `${employee} over weekly limit (${assignments.length} shifts)`,
				description: `Assigned ${assignments.length} shifts — recommended max is ${MAX_SHIFTS}`,
				cells,
				explanation: `${employee} is scheduled for ${assignments.length} shifts this week, exceeding the recommended maximum of ${MAX_SHIFTS}. Overworking employees leads to fatigue, errors, and burnout.`,
				fix: `Distribute some of ${employee}'s shifts to other employees who have capacity. Consider ${EMPLOYEES.filter((e) => e !== employee).join(", ")}.`,
			},
		];
	});
};

/**
 * WARNING — Any Saturday or Sunday shift left unassigned.
 * Weekend coverage is usually expected.
 */
const checkWeekendCoverage: ConstraintRule = (schedule) => {
	const WEEKEND: Day[] = ["Sat", "Sun"];
	const issues: Issue[] = [];

	for (const day of WEEKEND) {
		for (const shift of SHIFTS) {
			const key = cellKey(day, shift);
			if (schedule[key] === null) {
				issues.push({
					id: `weekend-unassigned-${key}`,
					severity: "warning",
					title: `${DAY_LABELS[day]} ${shift} unassigned`,
					description: `Weekend shift has no coverage`,
					cells: [key],
					explanation: `The ${DAY_LABELS[day]} ${shift} shift is currently unassigned. Weekend shifts require coverage — leaving them empty may result in service gaps.`,
					fix: `Assign an available employee to the ${DAY_LABELS[day]} ${shift} shift. Check who has fewer than ${5} shifts this week.`,
				});
			}
		}
	}

	return issues;
};

/**
 * WARNING — A single employee covers all 3 shifts on the same day.
 * Caught by double-booking too, but this surfaces as an explicit solo-day pattern.
 */
const checkAloneAllDay: ConstraintRule = (schedule) => {
	return DAYS.flatMap((day) => {
		const assignments = getAssignmentsForDay(schedule, day);
		if (assignments.length < 3) return [];

		const uniqueEmployees = new Set(assignments.map((a) => a.employee));
		if (uniqueEmployees.size > 1) return [];

		const [solo] = uniqueEmployees;
		const cells = SHIFTS.map((s) => cellKey(day, s));

		return [
			{
				id: `alone-all-day-${day}-${solo}`,
				severity: "warning" as Severity,
				title: `${solo} is the only employee on ${day}`,
				description: `Covers all 3 shifts on ${DAY_LABELS[day]} alone`,
				cells,
				explanation: `${solo} is scheduled for every shift on ${DAY_LABELS[day]} (Morning, Afternoon, and Night). Even if shifts don't overlap, having a single employee cover an entire day creates a single point of failure and leaves no backup.`,
				fix: `Assign at least one other employee to a ${DAY_LABELS[day]} shift to distribute responsibility.`,
			},
		];
	});
};

// ─── Rule registry ────────────────────────────────────────────────────────────

const RULES: ConstraintRule[] = [
	checkDoubleBooking,
	checkNightThenMorning,
	checkMaxShiftsPerWeek,
	checkWeekendCoverage,
	checkAloneAllDay,
];

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Run all constraint rules against the schedule.
 * Returns a deduplicated list: errors first, then warnings.
 */
export function validateSchedule(schedule: Schedule): Issue[] {
	const all = RULES.flatMap((rule) => rule(schedule));

	// Deduplicate by id (rules shouldn't produce duplicates, but be safe)
	const seen = new Set<string>();
	const unique = all.filter(({ id }) => {
		if (seen.has(id)) return false;
		seen.add(id);
		return true;
	});

	// Errors first, then warnings — stable sort preserves insertion order within groups
	return unique.sort((a, b) => {
		if (a.severity === b.severity) return 0;
		return a.severity === "error" ? -1 : 1;
	});
}
