import type { StaffingLevel } from "@/lib/seed-data";

export type StaffingStatus = StaffingLevel["status"];

/** Static Tailwind class strings — MUST be complete strings for tree-shaking. */
export const STAFFING_CLASSES: Record<StaffingStatus, string> = {
	understaffed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
	ok: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
	overstaffed: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export const STAFFING_LABELS: Record<StaffingStatus, string> = {
	understaffed: "Understaffed",
	ok: "Adequate",
	overstaffed: "Overstaffed",
};
