import React, { useState, useEffect } from 'react';
import { Flashcard } from '@/lib/types';
import { 
	Target, 
	Zap, 
	Calendar, 
	Clock, 
	BookOpen, 
	Play,
	ChevronRight,
	RefreshCw
} from 'lucide-react';

interface DueCardsOverviewProps {
	folderId: string;
	onStartStudySession: () => void;
	mounted?: boolean;
}

interface DueCardsResponse {
	folder: {
		id: string;
		name: string;
	};
	cards: {
		dueNow: Flashcard[];
		learning: Flashcard[];
		upcoming: Flashcard[];
		future: Flashcard[];
	};
	dueCards: Flashcard[];
	totalDue: number;
	summary: {
		totalCards: number;
		dueNow: number;
		learning: number;
		upcoming: number;
		future: number;
	};
}

export const DueCardsOverview: React.FC<DueCardsOverviewProps> = ({
	folderId,
	onStartStudySession,
	mounted = true,
}) => {
	const [data, setData] = useState<DueCardsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		fetchDueCards();
	}, [folderId]);

	const fetchDueCards = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/flashcard/due-cards?folderId=${folderId}`);
			
			if (!response.ok) {
				throw new Error('Failed to fetch due cards');
			}

			const result: DueCardsResponse = await response.json();
			setData(result);
			setError('');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load cards');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="bg-gray-900/50 border border-gray-800 p-8">
				<div className="flex items-center justify-center h-32">
					<div className="text-center">
						<div className="w-8 h-8 border-2 border-blue-400 border-t-transparent animate-spin mx-auto mb-4" />
						<p className="text-gray-400">Loading study overview...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="bg-gray-900/50 border border-gray-800 p-8">
				<div className="text-center">
					<Target className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-50" />
					<h3 className="text-lg font-semibold text-white mb-2">Failed to Load</h3>
					<p className="text-gray-400 mb-4">{error || 'Failed to load study overview'}</p>
					<button
						onClick={fetchDueCards}
						className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
					>
						<RefreshCw className="w-4 h-4" />
						Try Again
					</button>
				</div>
			</div>
		);
	}

	const { cards, summary, totalDue } = data;

	const cardCategories = [
		{
			title: 'Due Now',
			description: 'Cards ready for review',
			count: summary.dueNow,
			cards: cards.dueNow,
			icon: Target,
			color: 'text-red-400',
			bgColor: 'bg-red-900/20',
			borderColor: 'border-red-800/50',
			priority: 'high' as const,
		},
		{
			title: 'Learning',
			description: 'New cards in learning phase',
			count: summary.learning,
			cards: cards.learning,
			icon: Zap,
			color: 'text-yellow-400',
			bgColor: 'bg-yellow-900/20',
			borderColor: 'border-yellow-800/50',
			priority: 'medium' as const,
		},
		{
			title: 'Upcoming',
			description: 'Due within 24 hours',
			count: summary.upcoming,
			cards: cards.upcoming,
			icon: Calendar,
			color: 'text-blue-400',
			bgColor: 'bg-blue-900/20',
			borderColor: 'border-blue-800/50',
			priority: 'low' as const,
		},
		{
			title: 'Future',
			description: 'Scheduled for later',
			count: summary.future,
			cards: cards.future,
			icon: Clock,
			color: 'text-gray-400',
			bgColor: 'bg-gray-900/20',
			borderColor: 'border-gray-800/50',
			priority: 'low' as const,
		},
	];

	const getNextReviewTime = (card: Flashcard) => {
		const now = new Date();
		const reviewDate = new Date(card.nextReviewDate);
		const diffMs = reviewDate.getTime() - now.getTime();
		
		if (diffMs <= 0) return 'Now';
		
		const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
		
		if (diffHours < 24) return `${diffHours}h`;
		if (diffDays < 7) return `${diffDays}d`;
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w`;
		return `${Math.ceil(diffDays / 30)}mo`;
	};

	return (
		<div
			className="bg-gray-900/50 border border-gray-800 p-6 space-y-6"
			style={{
				opacity: mounted ? 1 : 0,
				transform: mounted ? 'translateY(0)' : 'translateY(10px)',
				transition: 'all 0.2s ease-out',
			}}
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-semibold text-white mb-1">Study Overview</h3>
					<p className="text-sm text-gray-400">
						{totalDue > 0 ? `${totalDue} cards ready for review` : 'All caught up!'}
					</p>
				</div>
				
				{totalDue > 0 && (
					<button
						onClick={onStartStudySession}
						className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
					>
						<Play className="w-4 h-4" />
						Start Studying
					</button>
				)}
			</div>

			{/* Cards Categories */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{cardCategories.map((category, index) => {
					const Icon = category.icon;
					
					return (
						<div
							key={category.title}
							className={`
								p-4 border ${category.borderColor} ${category.bgColor}
								hover:scale-105 transition-all duration-200
								${category.count > 0 ? 'cursor-pointer' : ''}
							`}
							style={{
								opacity: mounted ? 1 : 0,
								transform: mounted ? 'translateY(0)' : 'translateY(10px)',
								transition: 'all 0.2s ease-out',
								transitionDelay: `${index * 40}ms`,
							}}
						>
							<div className="flex items-center justify-between mb-3">
								<Icon className={`w-5 h-5 ${category.color}`} />
								<span className={`text-2xl font-bold ${category.color}`}>
									{category.count}
								</span>
							</div>
							<div>
								<h4 className="font-semibold text-white mb-1">{category.title}</h4>
								<p className="text-xs text-gray-400">{category.description}</p>
							</div>
						</div>
					);
				})}
			</div>

			{/* Detailed Card Lists */}
			{cardCategories.some(cat => cat.count > 0) && (
				<div className="space-y-4">
					{cardCategories
						.filter(category => category.count > 0)
						.slice(0, 2) // Show only first 2 categories with cards
						.map((category, categoryIndex) => (
							<div
								key={category.title}
								className="space-y-2"
								style={{
									opacity: mounted ? 1 : 0,
									transform: mounted ? 'translateY(0)' : 'translateY(10px)',
									transition: 'all 0.2s ease-out',
									transitionDelay: `${(cardCategories.length + categoryIndex) * 40}ms`,
								}}
							>
								<div className="flex items-center gap-2 mb-3">
									<category.icon className={`w-4 h-4 ${category.color}`} />
									<h4 className="font-medium text-white">{category.title}</h4>
									<span className={`text-sm ${category.color}`}>({category.count})</span>
								</div>
								
								<div className="space-y-2 max-h-48 overflow-y-auto">
									{category.cards.slice(0, 5).map((card, cardIndex) => (
										<div
											key={card.id}
											className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
										>
											<div className="flex-1 min-w-0">
												<p className="text-sm text-white truncate font-medium">
													{card.question}
												</p>
												<div className="flex items-center gap-2 mt-1">
													<span className="text-xs text-gray-400">
														{card.category}
													</span>
													<span className="text-xs text-gray-500">•</span>
													<span className="text-xs text-gray-400">
														{card.difficulty}
													</span>
												</div>
											</div>
											
											<div className="flex items-center gap-2 text-xs text-gray-400">
												<span>{getNextReviewTime(card)}</span>
												<ChevronRight className="w-3 h-3" />
											</div>
										</div>
									))}
									
									{category.cards.length > 5 && (
										<div className="text-center py-2 text-sm text-gray-400">
											+{category.cards.length - 5} more cards
										</div>
									)}
								</div>
							</div>
						))}
				</div>
			)}

			{/* Empty State */}
			{totalDue === 0 && summary.totalCards > 0 && (
				<div
					className="text-center py-8"
					style={{
						opacity: mounted ? 1 : 0,
						transform: mounted ? 'scale(1)' : 'scale(0.95)',
						transition: 'all 0.2s ease-out',
						transitionDelay: '100ms',
					}}
				>
					<div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-4">
						<BookOpen className="w-8 h-8 text-emerald-400" />
					</div>
					<h3 className="text-lg font-semibold text-white mb-2">All Caught Up! 🎉</h3>
					<p className="text-gray-400 mb-4">
						No cards are due for review right now. Great job staying on top of your studies!
					</p>
					<p className="text-sm text-gray-500">
						Your next reviews will be available based on the spaced repetition schedule.
					</p>
				</div>
			)}

			{/* No Cards State */}
			{summary.totalCards === 0 && (
				<div
					className="text-center py-8"
					style={{
						opacity: mounted ? 1 : 0,
						transform: mounted ? 'scale(1)' : 'scale(0.95)',
						transition: 'all 0.2s ease-out',
						transitionDelay: '100ms',
					}}
				>
					<div className="w-16 h-16 bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
						<BookOpen className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-semibold text-white mb-2">No Cards Yet</h3>
					<p className="text-gray-400">
						Add some flashcards to this folder to start your spaced repetition journey!
					</p>
				</div>
			)}
		</div>
	);
};