import { memo, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { CellKey, Day, Employee, Severity, Shift } from "./domain";
import {
	cellKey,
	DAY_LABELS,
	DAYS,
	EMPLOYEES,
	SHIFT_LABELS,
	SHIFTS,
	getAssignmentsForDay,
} from "./domain";
import { GripVertical, X, Plus, Calendar } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

interface ShiftGridProps {
	schedule: Record<CellKey, Employee | null>;
	highlightedCells: Set<CellKey>;
	activeIssueSeverity: Severity | null;
	onAssign: (key: CellKey, employee: Employee | null) => void;
}

export const ShiftGrid = memo(function ShiftGrid({
	schedule,
	highlightedCells,
	activeIssueSeverity,
	onAssign,
}: ShiftGridProps) {
	const getHighlightClass = (severity: Severity | null) => {
		if (!severity) return "";
		return severity === "error"
			? "bg-red-50 dark:bg-red-900/20 border-2 border-red-500"
			: "bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500";
	};

	const highlightClass = getHighlightClass(activeIssueSeverity);

	return (
		<div className="flex flex-col gap-6">
			<div className="grid grid-cols-[120px_repeat(3,1fr)] gap-4 text-sm font-medium tracking-wider text-muted-foreground uppercase">
				<div className="px-4">Day</div>
				{SHIFTS.map((shift) => (
					<div key={shift} className="px-4 text-center">
						{SHIFT_LABELS[shift]}
					</div>
				))}
			</div>

			<div className="flex flex-col gap-4">
				{DAYS.map((day) => (
					<DayRow
						key={day}
						day={day}
						schedule={schedule}
						highlightedCells={highlightedCells}
						highlightClass={highlightClass}
						onAssign={onAssign}
					/>
				))}
			</div>
		</div>
	);
});

interface DayRowProps {
	day: Day;
	schedule: Record<CellKey, Employee | null>;
	highlightedCells: Set<CellKey>;
	highlightClass: string;
	onAssign: (key: CellKey, employee: Employee | null) => void;
}

const DayRow = memo(function DayRow({
	day,
	schedule,
	highlightedCells,
	highlightClass,
	onAssign,
}: DayRowProps) {
	return (
		<div className="grid grid-cols-[140px_repeat(3,1fr)] items-stretch gap-4">
			<div className="flex items-center rounded-xl border border-border/50 bg-muted/30 px-4 font-medium text-foreground">
				<div className="flex flex-col">
					<span className="text-lg leading-none">{DAY_LABELS[day]}</span>
					<span className="mt-1 text-xs font-normal tracking-wider text-muted-foreground uppercase">
						{day}
					</span>
				</div>
			</div>

			{SHIFTS.map((shift) => (
				<ShiftCell
					key={shift}
					day={day}
					shift={shift}
					value={schedule[cellKey(day, shift)]}
					highlighted={highlightedCells.has(cellKey(day, shift))}
					highlightClass={highlightClass}
					schedule={schedule}
					onAssign={onAssign}
				/>
			))}
		</div>
	);
});

interface ShiftCellProps {
	day: Day;
	shift: Shift;
	value: Employee | null;
	highlighted: boolean;
	highlightClass: string;
	schedule: Record<CellKey, Employee | null>;
	onAssign: (key: CellKey, employee: Employee | null) => void;
}

const ShiftCell = memo(function ShiftCell({
	day,
	shift,
	value,
	highlighted,
	highlightClass,
	schedule,
	onAssign,
}: ShiftCellProps) {
	const key = cellKey(day, shift);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const employeeShiftCounts = useMemo(() => {
		return EMPLOYEES.map((emp) => {
			const dayAssignments = getAssignmentsForDay(schedule, day);
			const isAssignedToday = dayAssignments.some((a) => a.employee === emp);
			const totalWeekShifts = Object.values(schedule).filter((e) => e === emp).length;
			return {
				employee: emp,
				shiftsToday: dayAssignments.length,
				totalWeekShifts,
				isAssignedToday,
			};
		});
	}, [schedule, day]);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		const effect = e.dataTransfer.effectAllowed;
		e.dataTransfer.dropEffect = effect === "copy" ? "copy" : "move";
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const employee = e.dataTransfer.getData("employee") as Employee;
		const sourceKey = e.dataTransfer.getData("sourceKey");

		if (employee) {
			if (sourceKey && sourceKey !== key) {
				onAssign(sourceKey as CellKey, null);
			}
			onAssign(key, employee);
		}
	};

	const handleDragStart = (e: React.DragEvent) => {
		if (value) {
			e.dataTransfer.setData("employee", value);
			e.dataTransfer.setData("sourceKey", key);
			e.dataTransfer.effectAllowed = "move";
		}
	};

	const handleRemove = (e?: React.MouseEvent | React.KeyboardEvent) => {
		e?.stopPropagation();
		onAssign(key, null);
	};

	const handleSelectEmployee = (employee: Employee) => {
		onAssign(key, employee);
		setIsDialogOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (!value) setIsDialogOpen(true);
		}
	};

	const handleDragStartInner = (e: React.DragEvent) => {
		e.stopPropagation();
		handleDragStart(e);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<button
				type="button"
				disabled={!!value}
				onClick={() => !value && setIsDialogOpen(true)}
				onKeyDown={handleKeyDown}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				className={cn(
					"relative flex h-18 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-card p-2 transition-all duration-200",
					highlighted ? highlightClass : "hover:border-primary/20 hover:bg-muted/30",
					value ? "cursor-grab border-solid border-border bg-card/50" : "cursor-pointer"
				)}
			>
				{value ? (
					<span
						draggable
						onDragStart={handleDragStartInner}
						className="group relative flex w-full cursor-grab items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 shadow-sm transition-all hover:border-primary/20 hover:shadow-md active:cursor-grabbing"
					>
						<span className="flex items-center gap-3">
							<span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
								{value.charAt(0)}
							</span>
							<span className="text-sm font-medium">{value}</span>
						</span>
						<span className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
							<span
								role="button"
								tabIndex={0}
								onClick={handleRemove}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										handleRemove(e as unknown as React.MouseEvent);
									}
								}}
								className="mr-1 flex cursor-pointer items-center rounded-md p-1 text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
							>
								<X className="h-4 w-4" />
							</span>
							<GripVertical className="h-4 w-4 cursor-grab text-muted-foreground/40" />
						</span>
					</span>
				) : (
					<span className="flex flex-col items-center gap-1 text-muted-foreground/30">
						<Plus className="h-5 w-5" />
						<span className="text-xs font-medium tracking-widest uppercase">Add</span>
					</span>
				)}
			</button>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Assign Shift</DialogTitle>
					<DialogDescription>
						Choose an employee for {DAY_LABELS[day]} - {shift}. Shows current workload.
					</DialogDescription>
				</DialogHeader>

				<div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto py-2">
					{employeeShiftCounts.map(
						({ employee, shiftsToday, totalWeekShifts, isAssignedToday }) => (
							<button
								key={employee}
								type="button"
								onClick={() => handleSelectEmployee(employee)}
								disabled={isAssignedToday}
								className={cn(
									"flex items-center justify-between rounded-lg border p-3 transition-all hover:border-primary/50 hover:bg-muted/50",
									isAssignedToday && "cursor-not-allowed bg-muted/30 opacity-50"
								)}
							>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
										{employee.charAt(0)}
									</div>
									<div className="flex flex-col items-start">
										<span className="font-medium">{employee}</span>
										<span className="text-xs text-muted-foreground">
											{isAssignedToday ? "Already assigned" : "Available"}
										</span>
									</div>
								</div>
								<div className="flex flex-col items-end text-xs">
									<div className="flex items-center gap-1 text-muted-foreground">
										<Calendar className="h-3 w-3" />
										<span>{shiftsToday} today</span>
									</div>
									<span className="text-muted-foreground">{totalWeekShifts}/5 week</span>
								</div>
							</button>
						)
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
});

export const DraggableEmployee = memo(function DraggableEmployee({
	employee,
}: {
	employee: Employee;
}) {
	const handleDragStart = (e: React.DragEvent) => {
		e.dataTransfer.setData("employee", employee);
		e.dataTransfer.setData("text/plain", employee);
		e.dataTransfer.effectAllowed = "copy";
	};

	return (
		<button
			type="button"
			tabIndex={0}
			draggable
			onDragStart={handleDragStart}
			className="flex cursor-grab items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md active:cursor-grabbing"
		>
			<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
				{employee.charAt(0)}
			</span>
			<span className="text-sm font-medium">{employee}</span>
		</button>
	);
});
