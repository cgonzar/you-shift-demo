import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Wand2 } from "lucide-react";
import type { Issue } from "./domain";

interface IssuesPanelProps {
	issues: Issue[];
	activeIssueId: string | null;
	onSelectIssue: (id: string | null) => void;
	onQuickFix?: (issue: Issue) => void;
}

export function IssuesPanel({
	issues,
	activeIssueId,
	onSelectIssue,
	onQuickFix,
}: IssuesPanelProps) {
	if (issues.length === 0) {
		return (
			<Card className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 border-0 bg-muted/10 text-center shadow-none">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
					<CheckCircle2 className="h-6 w-6" />
				</div>
				<div>
					<p className="text-sm font-medium text-foreground">No issues</p>
					<p className="mt-1 text-xs text-muted-foreground">All constraints are satisfied.</p>
				</div>
			</Card>
		);
	}

	const errors = issues.filter((i) => i.severity === "error");
	const warnings = issues.filter((i) => i.severity === "warning");

	return (
		<div className="flex flex-col gap-6">
			{errors.length > 0 && (
				<IssueGroup
					label="Errors"
					issues={errors}
					activeIssueId={activeIssueId}
					onSelectIssue={onSelectIssue}
					onQuickFix={onQuickFix}
					icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
				/>
			)}
			{warnings.length > 0 && (
				<IssueGroup
					label="Warnings"
					issues={warnings}
					activeIssueId={activeIssueId}
					onSelectIssue={onSelectIssue}
					onQuickFix={onQuickFix}
					icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
				/>
			)}
		</div>
	);
}

interface IssueGroupProps {
	label: string;
	issues: Issue[];
	activeIssueId: string | null;
	onSelectIssue: (id: string | null) => void;
	onQuickFix?: (issue: Issue) => void;
	icon: React.ReactNode;
}

function IssueGroup({
	label,
	issues,
	activeIssueId,
	onSelectIssue,
	onQuickFix,
	icon,
}: IssueGroupProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2 px-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
				{icon}
				<span>{label}</span>
			</div>
			{issues.map((issue) => (
				<IssueCard
					key={issue.id}
					issue={issue}
					isActive={issue.id === activeIssueId}
					onSelect={() => onSelectIssue(issue.id === activeIssueId ? null : issue.id)}
					onQuickFix={onQuickFix}
				/>
			))}
		</div>
	);
}

interface IssueCardProps {
	issue: Issue;
	isActive: boolean;
	onSelect: () => void;
	onQuickFix?: (issue: Issue) => void;
}

function IssueCard({ issue, isActive, onSelect, onQuickFix }: IssueCardProps) {
	const isError = issue.severity === "error";
	const canAutoFix = !issue.id.startsWith("weekend-unassigned");

	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"group w-full rounded-xl p-4 text-left transition-all duration-200",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
				isActive
					? "bg-card shadow-md ring-1 ring-border"
					: "bg-muted/30 hover:bg-muted/60 hover:text-foreground"
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<span
						className={cn(
							"text-sm font-medium transition-colors",
							isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
						)}
					>
						{issue.title}
					</span>
				</div>
				<div
					className={cn(
						"mt-1.5 h-2 w-2 shrink-0 rounded-full",
						isError ? "bg-red-500" : "bg-amber-500"
					)}
				/>
			</div>

			<p className="mt-2 text-xs leading-relaxed text-muted-foreground">{issue.description}</p>

			{isActive && (
				<div className="mt-4 animate-in space-y-3 border-t border-border/50 pt-3 duration-200 fade-in slide-in-from-top-1">
					<div>
						<p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
							Analysis
						</p>
						<p className="mt-1 text-xs text-foreground">{issue.explanation}</p>
					</div>
					<div>
						<p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
							Recommendation
						</p>
						<p className="mt-1 text-xs text-foreground">{issue.fix}</p>
					</div>

					{canAutoFix && onQuickFix && (
						<div className="pt-2">
							<span
								onClick={(e) => {
									e.stopPropagation();
									onQuickFix(issue);
								}}
								className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
							>
								<Wand2 className="h-3.5 w-3.5" />
								Auto-Resolve (Clear Shifts)
							</span>
						</div>
					)}
				</div>
			)}
		</button>
	);
}
