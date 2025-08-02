'use client'

import React from 'react'
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useSession } from '@/lib/auth-client'

function getTimeAgo(date: Date): string {
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / (1000 * 60))
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffMins < 1) return 'Just now'
	if (diffMins < 60) return `${diffMins}m ago`
	if (diffHours < 24) return `${diffHours}h ago`
	if (diffDays < 7) return `${diffDays}d ago`
	return date.toLocaleDateString()
}

export function RecentActivity() {
	const { data } = useSession()
	const { analytics, loading } = useAnalytics(undefined, '7')

	if (!data) {
		return (
			<DashboardCard title="Recent Activity" icon={Activity} iconColor="text-blue-400">
				<div className="text-center py-8">
					<Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
					<p className="text-gray-400">Sign in to see your recent activity</p>
				</div>
			</DashboardCard>
		)
	}

	if (loading) {
		return (
			<DashboardCard title="Recent Activity" icon={Activity} iconColor="text-blue-400">
				<div className="space-y-3">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="flex items-center gap-3 animate-pulse">
							<div className="w-8 h-8 bg-gray-700 rounded-full"></div>
							<div className="flex-1">
								<div className="w-24 h-3 bg-gray-700 rounded mb-1"></div>
								<div className="w-32 h-2 bg-gray-700 rounded"></div>
							</div>
							<div className="w-12 h-2 bg-gray-700 rounded"></div>
						</div>
					))}
				</div>
			</DashboardCard>
		)
	}

	const recentActivity = analytics?.recentActivity || []

	if (recentActivity.length === 0) {
		return (
			<DashboardCard title="Recent Activity" icon={Activity} iconColor="text-blue-400">
				<div className="text-center py-8">
					<Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
					<p className="text-gray-400">No recent activity</p>
					<p className="text-sm text-gray-500 mt-1">Start studying to see your progress here</p>
				</div>
			</DashboardCard>
		)
	}

	return (
		<DashboardCard title="Recent Activity" icon={Activity} iconColor="text-blue-400">
			<div className="space-y-3">
				{recentActivity.slice(0, 5).map((activity) => {
					const isCorrect = activity.wasCorrect
					const timeAgo = getTimeAgo(new Date(activity.createdAt))
					
					return (
						<div key={activity.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-b-0">
							<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
								isCorrect ? 'bg-emerald-900/50 border border-emerald-800' : 'bg-red-900/50 border border-red-800'
							}`}>
								{isCorrect ? (
									<CheckCircle className="w-4 h-4 text-emerald-400" />
								) : (
									<XCircle className="w-4 h-4 text-red-400" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className={`text-sm font-medium ${
										isCorrect ? 'text-emerald-400' : 'text-red-400'
									}`}>
										{isCorrect ? 'Correct' : 'Incorrect'} Answer
									</span>
									<span className="text-xs text-gray-500">Quality: {activity.quality}/5</span>
								</div>
								<div className="flex items-center gap-2 mt-1">
									<Clock className="w-3 h-3 text-gray-500" />
									<span className="text-xs text-gray-400">
										{activity.responseTime ? `${activity.responseTime.toFixed(1)}s` : 'No time recorded'}
									</span>
								</div>
							</div>
							<div className="text-xs text-gray-500 whitespace-nowrap">
								{timeAgo}
							</div>
						</div>
					)
				})}
			</div>
		</DashboardCard>
	)
}