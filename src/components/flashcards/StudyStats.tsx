import React, { useState, useEffect } from 'react';
import { StudyStats as StudyStatsType } from '@/lib/types';
import { 
	TrendingUp, 
	Target, 
	Clock, 
	BookOpen, 
	Zap, 
	Award,
	Calendar,
	BarChart3
} from 'lucide-react';

interface StudyStatsProps {
	folderId: string;
	mounted?: boolean;
}

interface StatsResponse {
	stats: StudyStatsType;
}

export const StudyStats: React.FC<StudyStatsProps> = ({
	folderId,
	mounted = true,
}) => {
	const [stats, setStats] = useState<StudyStatsType | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		fetchStats();
	}, [folderId]);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/flashcard/due-cards', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ folderId }),
			});

			if (!response.ok) {
				throw new Error('Failed to fetch study statistics');
			}

			const data: StatsResponse = await response.json();
			setStats(data.stats);
			setError('');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load statistics');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="bg-gray-900/50 border border-gray-800 p-6">
				<div className="flex items-center justify-center h-32">
					<div className="w-6 h-6 border-2 border-blue-400 border-t-transparent animate-spin" />
				</div>
			</div>
		);
	}

	if (error || !stats) {
		return (
			<div className="bg-gray-900/50 border border-gray-800 p-6">
				<div className="text-center text-gray-400">
					<BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
					<p className="text-sm">{error || 'No statistics available'}</p>
				</div>
			</div>
		);
	}

	const statItems = [
		{
			label: 'Total Cards',
			value: stats.totalCards.toString(),
			icon: BookOpen,
			color: 'text-blue-400',
			bgColor: 'bg-blue-900/20',
			borderColor: 'border-blue-800/50',
		},
		{
			label: 'Due Now',
			value: stats.cardsDue.toString(),
			icon: Target,
			color: 'text-red-400',
			bgColor: 'bg-red-900/20',
			borderColor: 'border-red-800/50',
		},
		{
			label: 'Learning',
			value: stats.cardsLearning.toString(),
			icon: Zap,
			color: 'text-yellow-400',
			bgColor: 'bg-yellow-900/20',
			borderColor: 'border-yellow-800/50',
		},
		{
			label: 'Graduated',
			value: stats.cardsGraduated.toString(),
			icon: Award,
			color: 'text-emerald-400',
			bgColor: 'bg-emerald-900/20',
			borderColor: 'border-emerald-800/50',
		},
		{
			label: 'Accuracy',
			value: `${stats.accuracy}%`,
			icon: TrendingUp,
			color: stats.accuracy >= 80 ? 'text-emerald-400' : stats.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400',
			bgColor: stats.accuracy >= 80 ? 'bg-emerald-900/20' : stats.accuracy >= 60 ? 'bg-yellow-900/20' : 'bg-red-900/20',
			borderColor: stats.accuracy >= 80 ? 'border-emerald-800/50' : stats.accuracy >= 60 ? 'border-yellow-800/50' : 'border-red-800/50',
		},
		{
			label: 'Avg. Ease',
			value: stats.averageEaseFactor.toString(),
			icon: BarChart3,
			color: 'text-purple-400',
			bgColor: 'bg-purple-900/20',
			borderColor: 'border-purple-800/50',
		},
		{
			label: 'Current Streak',
			value: stats.streakCurrent.toString(),
			icon: Calendar,
			color: 'text-orange-400',
			bgColor: 'bg-orange-900/20',
			borderColor: 'border-orange-800/50',
		},
		{
			label: 'Best Streak',
			value: stats.streakBest.toString(),
			icon: Award,
			color: 'text-pink-400',
			bgColor: 'bg-pink-900/20',
			borderColor: 'border-pink-800/50',
		},
	];

	const additionalStats = [
		{
			label: 'Total Reviews',
			value: stats.totalReviews.toString(),
		},
		{
			label: 'Avg. Response Time',
			value: stats.averageResponseTime ? `${stats.averageResponseTime}s` : 'N/A',
		},
	];

	return (
		<div
			className="bg-gray-900/50 border border-gray-800 p-6 space-y-4"
			style={{
				opacity: mounted ? 1 : 0,
				transform: mounted ? 'translateY(0)' : 'translateY(10px)',
				transition: 'all 0.2s ease-out',
			}}
		>
			{/* Header */}
			<div>
				<h3 className="text-lg font-semibold text-white mb-2">Study Statistics</h3>
				<p className="text-sm text-gray-400">Your learning progress and performance metrics</p>
			</div>

			{/* Main Stats Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{statItems.map((stat, index) => {
					const Icon = stat.icon;
					
					return (
						<div
							key={stat.label}
							className={`
								p-4 border ${stat.borderColor} ${stat.bgColor}
								hover:scale-102 transition-transform duration-150
							`}
							style={{
								opacity: mounted ? 1 : 0,
								transform: mounted ? 'translateY(0)' : 'translateY(10px)',
								transition: 'all 0.2s ease-out',
								transitionDelay: `${index * 20}ms`,
							}}
						>
							<div className="flex items-center gap-2 mb-2">
								<Icon className={`w-4 h-4 ${stat.color}`} />
								<span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
									{stat.label}
								</span>
							</div>
							<div className={`text-2xl font-bold ${stat.color}`}>
								{stat.value}
							</div>
						</div>
					);
				})}
			</div>

			{/* Additional Stats */}
			<div className="pt-4 border-t border-gray-800">
				<div className="grid grid-cols-2 gap-4 text-sm">
					{additionalStats.map((stat, index) => (
						<div
							key={stat.label}
							className="flex justify-between items-center py-2"
							style={{
								opacity: mounted ? 1 : 0,
								transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
								transition: 'all 0.2s ease-out',
								transitionDelay: `${(statItems.length + index) * 50}ms`,
							}}
						>
							<span className="text-gray-400">{stat.label}</span>
							<span className="text-white font-medium">{stat.value}</span>
						</div>
					))}
				</div>
			</div>

			{/* Progress Indicators */}
			{stats.totalCards > 0 && (
				<div className="space-y-2">
					<div className="flex justify-between items-center text-sm">
						<span className="text-gray-400">Learning Progress</span>
						<span className="text-gray-300 text-xs">
							{Math.round((stats.cardsGraduated / stats.totalCards) * 100)}%
						</span>
					</div>
					<div className="w-full bg-gray-800 h-1.5 overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
							style={{
								width: `${(stats.cardsGraduated / stats.totalCards) * 100}%`,
							}}
						/>
					</div>
				</div>
			)}

			{/* Performance Insight */}
			{stats.totalReviews > 0 && (
				<div className="bg-gray-800/50 border border-gray-700 p-4">
					<div className="flex items-start gap-3">
						<div className="w-8 h-8 bg-blue-900/50 border border-blue-800 flex items-center justify-center flex-shrink-0">
							<TrendingUp className="w-4 h-4 text-blue-400" />
						</div>
						<div className="flex-1 text-sm">
							<p className="text-gray-300 mb-1">
								<strong>Performance Insight:</strong>
							</p>
							<p className="text-gray-400">
								{stats.accuracy >= 80
									? "Excellent work! Your accuracy is very high. Consider challenging yourself with harder material."
									: stats.accuracy >= 60
									? "Good progress! Focus on reviewing cards you find difficult to improve accuracy."
									: "Keep practicing! Regular review sessions will help improve your retention."}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};