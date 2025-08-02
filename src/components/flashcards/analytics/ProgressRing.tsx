'use client'

import React from 'react'

interface ProgressRingProps {
	progress: number; // 0-100
	size?: number;
	strokeWidth?: number;
	className?: string;
	children?: React.ReactNode;
	color?: string;
}

export function ProgressRing({
	progress,
	size = 120,
	strokeWidth = 8,
	className = '',
	children,
	color = '#10b981' // emerald-500
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (progress / 100) * circumference;

	return (
		<div className={`relative ${className}`} style={{ width: size, height: size }}>
			<svg
				width={size}
				height={size}
				className="transform -rotate-90"
			>
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-gray-800"
				/>
				
				{/* Progress circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className="transition-all duration-500 ease-in-out"
				/>
			</svg>
			
			{/* Content in center */}
			{children && (
				<div className="absolute inset-0 flex items-center justify-center">
					{children}
				</div>
			)}
		</div>
	);
}