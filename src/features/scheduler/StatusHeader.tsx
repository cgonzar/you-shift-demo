import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw } from "lucide-react";
import type { Issue } from "./domain";

interface StatusHeaderProps {
	issues: Issue[];
	onReset: () => void;
}

export function StatusHeader({ issues, onReset }: StatusHeaderProps) {
	const errors = issues.filter((i) => i.severity === "error");
	const warnings = issues.filter((i) => i.severity === "warning");
	const isValid = issues.length === 0;

	return (
		<header className="mt-auto flex h-20 w-full items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card/50 px-6 py-4 backdrop-blur-sm">
			<div className="flex items-center gap-6">
				{isValid ? (
					<div className="flex items-center gap-2.5 text-green-600 dark:text-green-400">
						<CheckCircle2 className="h-5 w-5" />
						<span className="text-sm font-medium">Schedule is valid</span>
					</div>
				) : (
					<div className="flex items-center gap-6">
						{errors.length > 0 && (
							<div className="flex items-center gap-2 text-red-600 dark:text-red-400">
								<XCircle className="h-5 w-5" />
								<span className="text-sm font-medium">
									{errors.length} {errors.length === 1 ? "Error" : "Errors"}
								</span>
							</div>
						)}
						{warnings.length > 0 && (
							<div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
								<AlertTriangle className="h-5 w-5" />
								<span className="text-sm font-medium">
									{warnings.length} {warnings.length === 1 ? "Warning" : "Warnings"}
								</span>
							</div>
						)}
					</div>
				)}
			</div>

			<Button
				variant="ghost"
				size="sm"
				onClick={onReset}
				className="text-muted-foreground hover:text-foreground"
			>
				<RotateCcw className="mr-2 h-3.5 w-3.5" />
				Reset
			</Button>
		</header>
	);
}
