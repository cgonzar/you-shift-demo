import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAY_LABELS, SHIFT_LABELS } from "@/features/scheduler/domain";
import { selectIssueById } from "@/lib/seed-data";

export function IssuePage() {
	const { id } = useParams<{ id: string }>();
	const issue = id ? selectIssueById(id) : undefined;

	if (!issue) {
		return (
			<div className="space-y-4">
				<Link
					to="/schedule"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					Back to Schedule
				</Link>

				<div className="space-y-2">
					<h1 className="text-2xl font-semibold">Issue not found</h1>
					<p className="text-muted-foreground">
						The issue you're looking for doesn't exist or has been resolved.
					</p>
				</div>
			</div>
		);
	}

	const affectedShifts = issue.cells.map((cell) => {
		const [day, shift] = cell.split("-") as [string, string];
		const dayLabel = DAY_LABELS[day as keyof typeof DAY_LABELS];
		const shiftLabel = SHIFT_LABELS[shift as keyof typeof SHIFT_LABELS];
		return `${dayLabel} ${shiftLabel}`;
	});

	const severityVariant = issue.severity === "error" ? "destructive" : "secondary";

	return (
		<div className="space-y-6">
			<Link
				to="/schedule"
				className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to Schedule
			</Link>

			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1 space-y-2">
							<Badge variant={severityVariant}>{issue.severity.toUpperCase()}</Badge>
							<CardTitle className="text-xl">{issue.title}</CardTitle>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					<div>
						<h3 className="mb-2 text-sm font-semibold">Description</h3>
						<p className="text-sm text-muted-foreground">{issue.description}</p>
					</div>

					<div className="border-t border-border pt-4">
						<h3 className="mb-3 text-sm font-semibold">Affected Shifts</h3>
						<div className="flex flex-wrap gap-2">
							{affectedShifts.map((shift) => (
								<Badge key={shift} variant="outline">
									{shift}
								</Badge>
							))}
						</div>
					</div>

					<div className="border-t border-border pt-4">
						<h3 className="mb-2 text-sm font-semibold">Why This Matters</h3>
						<p className="text-sm text-muted-foreground">{issue.explanation}</p>
					</div>

					<div className="border-t border-border pt-4">
						<h3 className="mb-3 text-sm font-semibold">Suggested Fix</h3>
						<div className="rounded-lg bg-muted p-4">
							<p className="text-sm text-muted-foreground">{issue.fix}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
