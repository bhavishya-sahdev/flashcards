'use client'

import React from 'react'
import { BookOpen, Clock, Brain, CheckCircle, Flame, Target } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { StatsCard } from '../analytics/StatsCard'
import { useFolders } from '@/hooks/useFolders'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useSession } from '@/lib/auth-client'

export function QuickStats() {
	const { data } = useSession()
	const { folders } = useFolders()
	const { analytics, loading } = useAnalytics(undefined, '7') // Last 7 days

	// Calculate basic stats from folders
	const totalCards = folders.reduce((sum, folder) => sum + folder.flashcards.length, 0)
	const cardsDue = folders.reduce((sum, folder) => {
		const due = folder.flashcards.filter(card => 
			new Date(card.nextReviewDate) <= new Date()
		).length
		return sum + due
	}, 0)

	if (loading || !data) {
		return (
			<DashboardCard title="Quick Stats" icon={Target} iconColor="text-emerald-400">
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="bg-gray-800/50 border border-gray-700 p-4 animate-pulse">
							<div className="w-8 h-8 bg-gray-700 rounded mb-2"></div>
							<div className="w-12 h-4 bg-gray-700 rounded mb-1"></div>
							<div className="w-16 h-3 bg-gray-700 rounded"></div>
						</div>
					))}
				</div>
			</DashboardCard>
		)
	}

	const stats = [
		{
			title: 'Total Cards',
			value: totalCards,
			icon: BookOpen,
			iconColor: 'text-blue-400'
		},
		{
			title: 'Due Now',
			value: cardsDue,
			icon: Clock,
			iconColor: 'text-yellow-400'
		},
		{
			title: 'Learning',
			value: analytics?.overview.cardsLearning || 0,
			icon: Brain,
			iconColor: 'text-purple-400'
		},
		{
			title: 'Mastered',
			value: analytics?.overview.cardsGraduated || 0,
			icon: CheckCircle,
			iconColor: 'text-emerald-400'
		},
		{
			title: 'Best Streak',
			value: analytics?.overview.allTimeBestStreak || 0,
			icon: Flame,
			iconColor: 'text-orange-400'
		},
		{
			title: 'Accuracy',
			value: `${analytics?.overview.accuracy || 0}%`,
			icon: Target,
			iconColor: 'text-emerald-400'
		}
	]

	return (
		<DashboardCard title="Quick Stats" icon={Target} iconColor="text-emerald-400">
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{stats.map((stat, index) => (
					<div key={stat.title} className="bg-gray-800/30 border border-gray-700 p-4 hover:border-gray-600 transition-colors">
						<div className="flex items-center gap-2 mb-2">
							<stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
							<span className="text-xs text-gray-400 font-medium">{stat.title}</span>
						</div>
						<div className="text-xl font-bold text-white">{stat.value}</div>
					</div>
				))}
			</div>
		</DashboardCard>
	)
}