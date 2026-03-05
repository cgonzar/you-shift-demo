import { useMemo } from "react";

interface SparklineProps {
	data: number[];
	width?: number;
	height?: number;
	strokeWidth?: number;
	className?: string;
}

export function Sparkline({
	data,
	width = 80,
	height = 24,
	strokeWidth = 1.5,
	className = "",
}: SparklineProps) {
	const points = useMemo(() => {
		if (data.length < 2) return "";

		const min = Math.min(...data);
		const max = Math.max(...data);
		const range = max - min || 1;

		const pad = 2;
		const plotW = width - pad * 2;
		const plotH = height - pad * 2;

		return data
			.map((v, i) => {
				const x = pad + (i / (data.length - 1)) * plotW;
				const y = pad + plotH - ((v - min) / range) * plotH;
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(" ");
	}, [data, width, height]);

	if (data.length < 2) {
		return (
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				className={className}
				aria-hidden="true"
			/>
		);
	}

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={className}
			aria-hidden="true"
		>
			<polyline
				points={points}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
