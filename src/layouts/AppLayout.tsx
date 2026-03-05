import { CalendarDays, Menu, X, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";

const NAV_ITEMS = [{ label: "Schedule", to: "/schedule", icon: CalendarDays }] as const;

export function AppLayout() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const { theme, setTheme } = useTheme();

	return (
		<div className="flex min-h-screen bg-background">
			{mobileOpen && (
				<button
					type="button"
					className="fixed inset-0 z-30 bg-black/40 lg:hidden"
					onClick={() => setMobileOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setMobileOpen(false);
					}}
					tabIndex={-1}
					aria-label="Close navigation"
				/>
			)}

			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
					mobileOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<div className="flex h-14 items-center justify-between border-b border-border px-4">
					<span className="text-sm font-bold tracking-tight text-foreground">youShift (demo)</span>
					<button
						type="button"
						className="rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
						onClick={() => setMobileOpen(false)}
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<nav className="flex flex-1 flex-col gap-1 px-3 py-4">
					{NAV_ITEMS.map(({ label, to, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							onClick={() => setMobileOpen(false)}
							className={({ isActive }) =>
								cn(
									"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
									isActive
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
								)
							}
						>
							<Icon className="h-4 w-4 shrink-0" />
							{label}
						</NavLink>
					))}
				</nav>

				<div className="flex items-center justify-between border-t border-border px-4 py-3">
					<p className="text-xs text-muted-foreground">Shift Builder (Mini)</p>
					<button
						type="button"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						aria-label="Toggle theme"
					>
						{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
					</button>
				</div>
			</aside>

			<div className="flex flex-1 flex-col">
				<header className="flex h-14 items-center gap-3 border-b border-border px-4 lg:hidden">
					<button
						type="button"
						className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
						onClick={() => setMobileOpen(true)}
					>
						<Menu className="h-5 w-5" />
					</button>
					<span className="text-sm font-bold tracking-tight text-foreground">youShift</span>
				</header>

				<main className="flex-1 overflow-y-auto">
					<div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
