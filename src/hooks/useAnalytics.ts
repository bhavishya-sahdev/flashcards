import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

interface AnalyticsOverview {
	totalCards: number;
	cardsDue: number;
	cardsLearning: number;
	cardsGraduated: number;
	totalReviews: number;
	accuracy: number;
	currentBestStreak: number;
	allTimeBestStreak: number;
	averageResponseTime: number;
	averageEaseFactor: number;
	timeSpentToday: number;
	timeSpentTotal: number;
}

interface DailyReview {
	date: string;
	total: number;
	correct: number;
	accuracy: number;
}

interface AnalyticsCharts {
	dailyReviews: DailyReview[];
	difficultyStats: Record<string, number>;
	categoryStats: Record<string, number>;
	folderStats: Record<string, any>;
}

interface RecentActivity {
	id: number;
	flashcardId: number;
	quality: number;
	wasCorrect: boolean;
	responseTime?: number;
	createdAt: string;
}

interface AnalyticsData {
	overview: AnalyticsOverview;
	charts: AnalyticsCharts;
	recentActivity: RecentActivity[];
}

export const useAnalytics = (folderId?: string, timeRange: string = '30') => {
	const { data: session } = useSession();
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAnalytics = async () => {
		if (!session?.user) {
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();
			if (folderId) params.append('folderId', folderId);
			params.append('timeRange', timeRange);

			const response = await fetch(`/api/flashcard/analytics?${params}`);

			if (!response.ok) {
				throw new Error('Failed to fetch analytics');
			}

			const data = await response.json();
			setAnalytics(data.analytics);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
			console.error('Error fetching analytics:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAnalytics();
	}, [session, folderId, timeRange]);

	const refreshAnalytics = () => {
		fetchAnalytics();
	};

	return {
		analytics,
		loading,
		error,
		refreshAnalytics,
		isAuthenticated: !!session?.user,
	};
};