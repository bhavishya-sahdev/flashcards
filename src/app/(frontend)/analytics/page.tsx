'use client'

import React, { useState } from 'react'
import { 
	BarChart3, 
	TrendingUp, 
	Target, 
	Clock, 
	Flame, 
	BookOpen, 
	CheckCircle, 
	Timer,
	Brain,
	Calendar,
	Loader2
} from 'lucide-react'
import { BackgroundAnimation } from '@/components/flashcards/BackgroundAnimation'
import { GlobalStyles } from '@/components/flashcards/GlobalStyles'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Navbar from '@/components/Navbar'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { SignUpDialog } from '@/components/auth/sign-up-dialog'
import { useSession } from '@/lib/auth-client'
import { useAnalytics } from '@/hooks/useAnalytics'
import { StatsCard } from '@/components/flashcards/analytics/StatsCard'
import { ProgressRing } from '@/components/flashcards/analytics/ProgressRing'
import { DailyReviewsChart } from '@/components/flashcards/charts/DailyReviewsChart'

export default function AnalyticsPage() {
	const { data } = useSession()
	const [timeRange, setTimeRange] = useState('30')
	const { analytics, loading, error, isAuthenticated } = useAnalytics(undefined, timeRange)

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
				<GlobalStyles />
				<BackgroundAnimation />
				<div className="flex items-center gap-2 mb-4">
					<SidebarTrigger className="text-white hover:text-gray-300" />
					<Navbar items={[{ label: 'Blog', href: "/blog" }]} itemsRight={[<div className='flex gap-2 items-center' key="auth">
						<>
							<SignInDialog triggerLabel='Sign in' />
							<SignUpDialog triggerLabel='Sign up' />
						</>
					</div>]} />
				</div>

				<div className="relative z-10 max-w-6xl mx-auto px-6 py-16 text-center">
					<div className="mb-16">
						<div className="flex items-center justify-center gap-4 mb-6">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
								<BarChart3 className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
									Analytics
								</h1>
								<div className="flex items-center justify-center gap-2 mt-1">
									<TrendingUp className="w-4 h-4 text-cyan-400" />
									<span className="text-sm text-gray-400 font-medium">Track your learning progress</span>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-gray-900/50 border border-gray-800 p-8 max-w-md mx-auto">
						<div className="w-16 h-16 bg-blue-900/50 border border-blue-800 flex items-center justify-center mx-auto mb-6">
							<BarChart3 className="w-8 h-8 text-blue-400" />
						</div>
						<h3 className="text-2xl font-semibold text-white mb-4">
							Sign in to view analytics
						</h3>
						<p className="text-gray-400 mb-6">
							Track your study progress, performance metrics, and learning insights with detailed analytics.
						</p>
						<div className="flex items-center justify-center gap-4">
							<SignInDialog triggerLabel="Sign In" />
							<SignUpDialog triggerLabel="Sign Up" />
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
				<GlobalStyles />
				<BackgroundAnimation />
				<div className="flex items-center gap-2 mb-4">
					<SidebarTrigger className="text-white hover:text-gray-300" />
					<Navbar items={[{ label: 'Blog', href: "/blog" }]} itemsRight={[<div className='flex gap-2 items-center' key="auth">
						<span className='text-sm font-medium text-gray-300'>Hey, {data?.user.name.split(" ")[0]}!</span>
					</div>]} />
				</div>

				<div className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex items-center justify-center">
					<div className="text-center">
						<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
						<p className="text-gray-400">Loading your analytics...</p>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
				<GlobalStyles />
				<BackgroundAnimation />
				<div className="flex items-center gap-2 mb-4">
					<SidebarTrigger className="text-white hover:text-gray-300" />
					<Navbar items={[{ label: 'Blog', href: "/blog" }]} itemsRight={[<div className='flex gap-2 items-center' key="auth">
						<span className='text-sm font-medium text-gray-300'>Hey, {data?.user.name.split(" ")[0]}!</span>
					</div>]} />
				</div>

				<div className="relative z-10 max-w-6xl mx-auto px-6 py-16 text-center">
					<div className="bg-gray-900/50 border border-red-800 p-8 max-w-md mx-auto">
						<h3 className="text-xl font-semibold text-red-400 mb-4">Failed to load analytics</h3>
						<p className="text-gray-400">{error}</p>
					</div>
				</div>
			</div>
		)
	}

	if (!analytics) return null

	return (
		<div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
			<GlobalStyles />
			<BackgroundAnimation />
			<div className="flex items-center gap-2 mb-4">
				<SidebarTrigger className="text-white hover:text-gray-300" />
				<Navbar items={[{ label: 'Blog', href: "/blog" }]} itemsRight={[<div className='flex gap-2 items-center' key="auth">
					<span className='text-sm font-medium text-gray-300'>Hey, {data?.user.name.split(" ")[0]}!</span>
				</div>]} />
			</div>

			<div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
				{/* Header */}
				<div className="mb-16">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
								<BarChart3 className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
									Analytics
								</h1>
								<div className="flex items-center gap-2 mt-1">
									<TrendingUp className="w-4 h-4 text-cyan-400" />
									<span className="text-sm text-gray-400 font-medium">Track your learning progress</span>
								</div>
							</div>
						</div>

						{/* Time Range Selector */}
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-400">Time range:</span>
							<select
								value={timeRange}
								onChange={(e) => setTimeRange(e.target.value)}
								className="bg-gray-800 border border-gray-700 text-white px-3 py-1 rounded text-sm focus:border-blue-500 focus:outline-none"
							>
								<option value="7">Last 7 days</option>
								<option value="30">Last 30 days</option>
								<option value="90">Last 90 days</option>
								<option value="365">Last year</option>
							</select>
						</div>
					</div>
				</div>

				{/* Overview Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
					<StatsCard
						title="Total Cards"
						value={analytics.overview.totalCards}
						icon={BookOpen}
						iconColor="text-blue-400"
					/>
					<StatsCard
						title="Cards Due"
						value={analytics.overview.cardsDue}
						icon={Clock}
						iconColor="text-yellow-400"
					/>
					<StatsCard
						title="Learning"
						value={analytics.overview.cardsLearning}
						icon={Brain}
						iconColor="text-purple-400"
					/>
					<StatsCard
						title="Graduated"
						value={analytics.overview.cardsGraduated}
						icon={CheckCircle}
						iconColor="text-emerald-400"
					/>
					<StatsCard
						title="Best Streak"
						value={analytics.overview.allTimeBestStreak}
						icon={Flame}
						iconColor="text-orange-400"
					/>
					<StatsCard
						title="Accuracy"
						value={`${analytics.overview.accuracy}%`}
						icon={Target}
						iconColor="text-emerald-400"
					/>
				</div>

				{/* Main Analytics Grid */}
				<div className="grid lg:grid-cols-3 gap-8 mb-12">
					{/* Accuracy Ring */}
					<div className="bg-gray-900/50 border border-gray-800 p-6">
						<h3 className="text-lg font-semibold text-white mb-6 text-center">Overall Accuracy</h3>
						<div className="flex justify-center">
							<ProgressRing
								progress={analytics.overview.accuracy}
								size={160}
								color="#10b981"
							>
								<div className="text-center">
									<div className="text-3xl font-bold text-white">
										{analytics.overview.accuracy}%
									</div>
									<div className="text-sm text-gray-400">Correct</div>
								</div>
							</ProgressRing>
						</div>
						<div className="text-center mt-4 text-sm text-gray-400">
							{analytics.overview.totalReviews} total reviews
						</div>
					</div>

					{/* Study Time */}
					<div className="bg-gray-900/50 border border-gray-800 p-6">
						<h3 className="text-lg font-semibold text-white mb-6">Study Time</h3>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4 text-blue-400" />
									<span className="text-gray-300">Today</span>
								</div>
								<span className="text-white font-semibold">{analytics.overview.timeSpentToday}m</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Timer className="w-4 h-4 text-purple-400" />
									<span className="text-gray-300">Total</span>
								</div>
								<span className="text-white font-semibold">{Math.round(analytics.overview.timeSpentTotal / 60)}h {analytics.overview.timeSpentTotal % 60}m</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Clock className="w-4 h-4 text-emerald-400" />
									<span className="text-gray-300">Avg Response</span>
								</div>
								<span className="text-white font-semibold">{analytics.overview.averageResponseTime}s</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Brain className="w-4 h-4 text-yellow-400" />
									<span className="text-gray-300">Ease Factor</span>
								</div>
								<span className="text-white font-semibold">{analytics.overview.averageEaseFactor}</span>
							</div>
						</div>
					</div>

					{/* Current Streak */}
					<div className="bg-gray-900/50 border border-gray-800 p-6">
						<h3 className="text-lg font-semibold text-white mb-6 text-center">Current Streak</h3>
						<div className="flex justify-center">
							<ProgressRing
								progress={Math.min((analytics.overview.currentBestStreak / Math.max(analytics.overview.allTimeBestStreak, 1)) * 100, 100)}
								size={160}
								color="#f97316"
							>
								<div className="text-center">
									<div className="text-3xl font-bold text-orange-400">
										{analytics.overview.currentBestStreak}
									</div>
									<div className="text-sm text-gray-400">Cards</div>
								</div>
							</ProgressRing>
						</div>
						<div className="text-center mt-4 text-sm text-gray-400">
							Best: {analytics.overview.allTimeBestStreak} cards
						</div>
					</div>
				</div>

				{/* Daily Reviews Chart */}
				<DailyReviewsChart 
					data={analytics.charts.dailyReviews} 
					className="mb-12"
				/>

				{/* Breakdown Stats */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{/* Difficulty Breakdown */}
					<div className="bg-gray-900/50 border border-gray-800 p-6">
						<h3 className="text-lg font-semibold text-white mb-6">Difficulty Distribution</h3>
						<div className="space-y-3">
							{Object.entries(analytics.charts.difficultyStats).map(([difficulty, count]) => {
								const percentage = analytics.overview.totalCards > 0 ? (count / analytics.overview.totalCards) * 100 : 0;
								const colors = {
									Easy: 'bg-green-500',
									Medium: 'bg-yellow-500',
									Hard: 'bg-red-500'
								};
								
								return (
									<div key={difficulty}>
										<div className="flex justify-between text-sm mb-1">
											<span className="text-gray-300">{difficulty}</span>
											<span className="text-white">{count} ({percentage.toFixed(1)}%)</span>
										</div>
										<div className="w-full bg-gray-800 rounded-full h-2">
											<div 
												className={`h-2 rounded-full ${colors[difficulty as keyof typeof colors]}`}
												style={{ width: `${percentage}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Category Breakdown */}
					<div className="bg-gray-900/50 border border-gray-800 p-6">
						<h3 className="text-lg font-semibold text-white mb-6">Categories</h3>
						<div className="space-y-3">
							{Object.entries(analytics.charts.categoryStats).slice(0, 5).map(([category, count], index) => {
								const percentage = analytics.overview.totalCards > 0 ? (count / analytics.overview.totalCards) * 100 : 0;
								const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-yellow-500', 'bg-pink-500'];
								
								return (
									<div key={category}>
										<div className="flex justify-between text-sm mb-1">
											<span className="text-gray-300 truncate">{category}</span>
											<span className="text-white">{count}</span>
										</div>
										<div className="w-full bg-gray-800 rounded-full h-2">
											<div 
												className={`h-2 rounded-full ${colors[index % colors.length]}`}
												style={{ width: `${percentage}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Folders Overview */}
					<div className="bg-gray-900/50 border border-gray-800 p-6">
						<h3 className="text-lg font-semibold text-white mb-6">Folders Overview</h3>
						<div className="space-y-3">
							{Object.entries(analytics.charts.folderStats).slice(0, 5).map(([folderName, stats]) => (
								<div key={folderName} className="border-b border-gray-800 pb-3 last:border-b-0">
									<div className="flex justify-between items-start mb-1">
										<span className="text-gray-300 text-sm truncate">{folderName}</span>
										<span className="text-white text-sm">{stats.total}</span>
									</div>
									<div className="flex gap-4 text-xs">
										<span className="text-yellow-400">{stats.due} due</span>
										<span className="text-purple-400">{stats.learning} learning</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}