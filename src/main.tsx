import { ThemeProvider } from "./components/theme/ThemeProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import "./index.css";
import { AppLayout } from "./layouts/AppLayout";
import { SchedulePage } from "./pages/SchedulePage";

const router = createBrowserRouter([
	{
		element: <AppLayout />,
		children: [
			{ index: true, element: <Navigate to="/schedule" replace /> },
			{ path: "schedule", element: <SchedulePage /> },
		],
	},
]);

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
	<StrictMode>
	<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<RouterProvider router={router} />
		</ThemeProvider>
	</StrictMode>
);
