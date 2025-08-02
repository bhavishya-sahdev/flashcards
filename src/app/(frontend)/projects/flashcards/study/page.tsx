'use client'

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Target, BookOpen, ArrowLeft, Play, Trophy, Clock, Brain, Lock, FolderOpen } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { SignInDialog } from '@/components/auth/sign-in-dialog';
import { SignUpDialog } from '@/components/auth/sign-up-dialog';
import { BackgroundAnimation } from '@/components/flashcards/BackgroundAnimation';
import { GlobalStyles } from '@/components/flashcards/GlobalStyles';
import { ErrorNotification } from '@/components/flashcards/ErrorNotification';
import { StudySession } from '@/components/flashcards/StudySession';
import { DashboardCard } from '@/components/flashcards/dashboard/DashboardCard';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface QuickStudyData {
	folders: Array<{ id: number; name: string }>;
	cards: {
		dueNow: any[];
		learning: any[];
		upcoming: any[];
		future: any[];
	};
	dueCards: any[];
	cardsByFolder: Record<string, any[]>;
	totalDue: number;
	summary: {
		totalCards: number;
		dueNow: number;
		learning: number;
		upcoming: number;
		future: number;
	};
}

const QuickStudyPage = () => {
	const { data } = useSession();
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');
	const [studyData, setStudyData] = useState<QuickStudyData | null>(null);
	const [showStudySession, setShowStudySession] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!data) {
			setLoading(false);
			return;
		}

		fetchQuickStudyData();
	}, [data]);

	const fetchQuickStudyData = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/flashcard/quick-study');
			
			if (!response.ok) {
				throw new Error('Failed to fetch study data');
			}

			const data = await response.json();
			setStudyData(data);
		} catch (error) {
			console.error('Error fetching quick study data:', error);
			setError('Failed to load study data. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const staggerDelay = (index: number) => ({
		transform: mounted ? 'translateY(0)' : 'translateY(20px)',
		opacity: mounted ? 1 : 0,
		transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
		transitionDelay: `${index * 100}ms`
	});

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
					<p className="text-gray-400">Loading quick study...</p>
				</div>
			</div>
		);
	}

	// Not authenticated
	if (!data) {
		return (
			<div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
				<GlobalStyles />
				<BackgroundAnimation />
				<div className="flex items-center gap-2 mb-4">
					<SidebarTrigger className="text-white hover:text-gray-300 mx-4" />
					<Navbar items={[{ label: 'Blog', href: "/blog" }]} itemsRight={[<div className='flex gap-2 items-center' key="auth">
						<SignInDialog triggerLabel='Sign in' />
						<SignUpDialog triggerLabel='Sign up' />
					</div>]} />
				</div>

				<div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
					<div className="mb-8" style={staggerDelay(0)}>
						<div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
							<Target className="w-10 h-10 text-white" />
						</div>
						<h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
							Quick Study
						</h1>
						<p className="text-gray-400 text-lg max-w-2xl mx-auto">
							Study due cards from all your folders in one optimized session. Sign in to access your personalized study schedule.
						</p>
					</div>

					<div className="border border-gray-800 p-8 bg-gray-900/30 backdrop-blur-sm mb-8" style={staggerDelay(1)}>
						<div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-6">
							<Lock className="w-8 h-8 text-emerald-400" />
						</div>
						<h3 className="text-2xl font-semibold text-white mb-4">
							Sign in to start studying
						</h3>
						<p className="text-gray-400 mb-6 max-w-md mx-auto">
							Get access to spaced repetition across all your folders, progress tracking, and personalized study sessions.
						</p>
						
						<div className="flex items-center justify-center gap-4 mb-8">
							<SignInDialog triggerLabel="Sign In" />
							<SignUpDialog triggerLabel="Sign Up" />
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto pt-6 border-t border-gray-800">
							<div className="text-center">
								<Target className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
								<h4 className="font-medium text-white mb-2">Smart Scheduling</h4>
								<p className="text-sm text-gray-400">Cards appear exactly when you need to review them</p>
							</div>
							<div className="text-center">
								<Brain className="w-8 h-8 text-blue-400 mx-auto mb-3" />
								<h4 className="font-medium text-white mb-2">Cross-Folder Study</h4>
								<p className="text-sm text-gray-400">Study cards from all folders in one session</p>
							</div>
							<div className="text-center">
								<Trophy className="w-8 h-8 text-purple-400 mx-auto mb-3" />
								<h4 className="font-medium text-white mb-2">Progress Tracking</h4>
								<p className="text-sm text-gray-400">Monitor your learning progress and streaks</p>
							</div>
						</div>
					</div>

					<Link
						href="/projects/flashcards"
						className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
				<div className="text-center max-w-md">
					<AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
					<h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
					<p className="text-gray-400 mb-4">{error}</p>
					<button
						onClick={fetchQuickStudyData}
						className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors mr-2"
					>
						Try Again
					</button>
					<Link
						href="/projects/flashcards"
						className="inline-flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	// Show study session if started
	if (showStudySession && studyData) {
		return (
			<div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
				<GlobalStyles />
				<BackgroundAnimation />
				<div className="flex items-center gap-2 mb-4">
					<SidebarTrigger className="text-white hover:text-gray-300 mx-4" />
					<Navbar items={[{ label: 'Blog', href: "/blog" }]} itemsRight={[<div className='flex gap-2 items-center' key="auth">
						<span className='text-sm font-medium text-gray-300'>Hey, {data.user.name.split(" ")[0]}!</span>
					</div>]} />
				</div>

				<div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
					<DashboardCard title="Quick Study Session" icon={Target} iconColor="text-emerald-400">
						<StudySession
							// Pass null for folderId to indicate cross-folder study
							folderId={null}
							onSessionComplete={() => {
								setShowStudySession(false);
								fetchQuickStudyData(); // Refresh data after session
							}}
							mounted={mounted}
							customCards={studyData.dueCards}
						/>
					</DashboardCard>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
			<GlobalStyles />
			<BackgroundAnimation />
			<div className="flex items-center gap-2 mb-4">
				<SidebarTrigger className="text-white hover:text-gray-300 mx-4" />
				<Navbar items={[{ label: 'Blog', href: "/blog" }]} itemsRight={[<div className='flex gap-2 items-center' key="auth">
					<span className='text-sm font-medium text-gray-300'>Hey, {data.user.name.split(" ")[0]}!</span>
				</div>]} />
			</div>

			<div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8" style={staggerDelay(0)}>
					<Link
						href="/projects/flashcards"
						className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Dashboard
					</Link>
					<div className="flex items-center gap-4 mb-2">
						<div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-2xl">
							<Target className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
								Quick Study
							</h1>
							<div className="flex items-center gap-2 mt-1">
								<Brain className="w-4 h-4 text-cyan-400" />
								<span className="text-sm text-gray-400 font-medium">Study cards from all folders</span>
							</div>
						</div>
					</div>
				</div>

				{/* Study Overview */}
				<div className="grid gap-6">
					{studyData && studyData.totalDue > 0 ? (
						<>
							{/* Stats Cards */}
							<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4" style={staggerDelay(1)}>
								<div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<Clock className="w-4 h-4 text-red-400" />
										<span className="text-sm text-gray-400">Due Now</span>
									</div>
									<div className="text-2xl font-bold text-white">{studyData.summary.dueNow}</div>
								</div>
								<div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<Brain className="w-4 h-4 text-yellow-400" />
										<span className="text-sm text-gray-400">Learning</span>
									</div>
									<div className="text-2xl font-bold text-white">{studyData.summary.learning}</div>
								</div>
								<div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<Target className="w-4 h-4 text-emerald-400" />
										<span className="text-sm text-gray-400">Total Due</span>
									</div>
									<div className="text-2xl font-bold text-white">{studyData.totalDue}</div>
								</div>
								<div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<BookOpen className="w-4 h-4 text-blue-400" />
										<span className="text-sm text-gray-400">Total Cards</span>
									</div>
									<div className="text-2xl font-bold text-white">{studyData.summary.totalCards}</div>
								</div>
							</div>

							{/* Start Study Session */}
							<div style={staggerDelay(2)}>
								<DashboardCard 
									title="Ready to Study" 
									icon={Play} 
									iconColor="text-emerald-400"
								>
								<div className="text-center py-8">
									<div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-6">
										<Play className="w-8 h-8 text-emerald-400" />
									</div>
									<h3 className="text-2xl font-semibold text-white mb-4">
										{studyData.totalDue} cards ready for review
									</h3>
									<p className="text-gray-400 mb-6 max-w-md mx-auto">
										Study cards from all your folders using our advanced spaced repetition algorithm.
									</p>
									<button
										onClick={() => setShowStudySession(true)}
										className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg"
									>
										<Play className="w-5 h-5" />
										Start Study Session
									</button>
								</div>
								</DashboardCard>
							</div>

							{/* Cards by Folder */}
							{Object.keys(studyData.cardsByFolder).length > 0 && (
								<div style={staggerDelay(3)}>
									<DashboardCard 
										title="Cards by Folder" 
										icon={FolderOpen} 
										iconColor="text-blue-400"
									>
									<div className="space-y-3">
										{Object.entries(studyData.cardsByFolder).map(([folderName, cards]) => (
											<div key={folderName} className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
												<div className="flex items-center gap-3">
													<FolderOpen className="w-4 h-4 text-blue-400" />
													<span className="font-medium text-white">{folderName}</span>
												</div>
												<div className="text-sm text-gray-400">
													{cards.length} card{cards.length !== 1 ? 's' : ''}
												</div>
											</div>
										))}
									</div>
									</DashboardCard>
								</div>
							)}
						</>
					) : (
						// No cards due
						<div style={staggerDelay(1)}>
							<DashboardCard 
								title="All Caught Up!" 
								icon={Trophy} 
								iconColor="text-emerald-400"
							>
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-6">
									<Trophy className="w-8 h-8 text-emerald-400" />
								</div>
								<h3 className="text-2xl font-semibold text-white mb-4">
									Great job! No cards due right now
								</h3>
								<p className="text-gray-400 mb-6 max-w-md mx-auto">
									{studyData?.summary.totalCards === 0 
										? "You don't have any flashcards yet. Create some folders and cards to get started!"
										: "You're all caught up with your reviews. Cards will become available as their review schedules come due."
									}
								</p>
								<div className="flex items-center justify-center gap-4">
									<Link
										href="/projects/flashcards"
										className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
									>
										<ArrowLeft className="w-4 h-4" />
										Back to Dashboard
									</Link>
									{studyData?.summary.totalCards === 0 && (
										<Link
											href="/projects/flashcards"
											className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
										>
											<BookOpen className="w-4 h-4" />
											Create Cards
										</Link>
									)}
								</div>
							</div>
							</DashboardCard>
						</div>
					)}
				</div>

				{error && (
					<ErrorNotification
						message={error}
						onClose={() => setError('')}
					/>
				)}
			</div>
		</div>
	);
};

export default QuickStudyPage;