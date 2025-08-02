'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
	title: string
	children: React.ReactNode
	icon?: LucideIcon
	iconColor?: string
	className?: string
	headerActions?: React.ReactNode
}

export function DashboardCard({
	title,
	children,
	icon: Icon,
	iconColor = 'text-blue-400',
	className = '',
	headerActions
}: DashboardCardProps) {
	return (
		<div className={`bg-gray-900/50 border border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-all duration-200 ${className}`}>
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						{Icon && (
							<div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700">
								<Icon className={`w-5 h-5 ${iconColor}`} />
							</div>
						)}
						<h3 className="text-lg font-semibold text-white">{title}</h3>
					</div>
					{headerActions && (
						<div className="flex items-center gap-2">
							{headerActions}
						</div>
					)}
				</div>
				{children}
			</div>
		</div>
	)
}