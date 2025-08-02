'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: LucideIcon;
	iconColor?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	className?: string;
}

export function StatsCard({
	title,
	value,
	subtitle,
	icon: Icon,
	iconColor = 'text-gray-400',
	trend,
	className = ''
}: StatsCardProps) {
	return (
		<div className={`bg-gray-900/50 border border-gray-800 p-6 hover:border-gray-700 transition-colors ${className}`}>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						<Icon className={`w-5 h-5 ${iconColor}`} />
						<h3 className="text-sm font-medium text-gray-400">{title}</h3>
					</div>
					
					<div className="space-y-1">
						<div className="text-2xl font-bold text-white">{value}</div>
						{subtitle && (
							<div className="text-sm text-gray-500">{subtitle}</div>
						)}
					</div>
				</div>
				
				{trend && (
					<div className={`flex items-center gap-1 text-sm ${
						trend.isPositive ? 'text-emerald-400' : 'text-red-400'
					}`}>
						<span>{trend.isPositive ? '↗' : '↘'}</span>
						<span>{Math.abs(trend.value)}%</span>
					</div>
				)}
			</div>
		</div>
	);
}