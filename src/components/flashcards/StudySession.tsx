import React, { useState, useEffect } from 'react';
import { Flashcard, ReviewQuality } from '@/lib/types';
import { ReviewButtons } from './ReviewButtons';
import { CodeEditor } from './CodeEditor';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CheckCircle, BookOpen, ArrowRight, RotateCcw, Clock, Target, TrendingUp, HelpCircle } from 'lucide-react';

interface StudySessionProps {
	folderId: string | null; // null indicates cross-folder study
	onSessionComplete: () => void;
	mounted?: boolean;
	customCards?: Flashcard[]; // For cross-folder study, pass cards directly
}

interface DueCardsResponse {
	folder: {
		id: string;
		name: string;
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

export const StudySession: React.FC<StudySessionProps> = ({
	folderId,
	onSessionComplete,
	mounted = true,
	customCards,
}) => {
	const [dueCards, setDueCards] = useState<Flashcard[]>([]);
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [showAnswer, setShowAnswer] = useState(false);
	const [showCodeEditor, setShowCodeEditor] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');
	const [folderName, setFolderName] = useState('');
	
	// Session tracking
	const [sessionStartTime] = useState(new Date());
	const [cardStartTime, setCardStartTime] = useState<Date>();
	const [reviewedCards, setReviewedCards] = useState<string[]>([]);
	const [correctCount, setCorrectCount] = useState(0);
	const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

	const currentCard = dueCards[currentCardIndex];

	// Fetch due cards or use custom cards
	useEffect(() => {
		if (customCards) {
			// Use provided cards for cross-folder study
			setDueCards(customCards);
			setFolderName('All Folders');
			setLoading(false);
		} else if (folderId) {
			// Fetch cards for specific folder
			fetchDueCards();
		}
	}, [folderId, customCards]);

	// Start timing when card is shown
	useEffect(() => {
		if (currentCard && !showAnswer) {
			setCardStartTime(new Date());
		}
	}, [currentCard, showAnswer]);

	const fetchDueCards = async () => {
		if (!folderId) return;
		
		try {
			setLoading(true);
			const response = await fetch(`/api/flashcard/due-cards?folderId=${folderId}`);
			
			if (!response.ok) {
				throw new Error('Failed to fetch due cards');
			}

			const data: DueCardsResponse = await response.json();
			setDueCards(data.dueCards);
			setFolderName(data.folder.name);
			setError('');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load cards');
		} finally {
			setLoading(false);
		}
	};

	const handleReview = async (quality: ReviewQuality, responseTime?: number) => {
		if (!currentCard) return;

		try {
			const response = await fetch('/api/flashcard/reviews', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					flashcardId: currentCard.id,
					quality,
					responseTime,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to submit review');
			}

			// Track this review
			setReviewedCards(prev => [...prev, currentCard.id]);
			if (quality >= 3) {
				setCorrectCount(prev => prev + 1);
			}

			// Move to next card or finish session
			const nextIndex = currentCardIndex + 1;
			if (nextIndex >= dueCards.length) {
				onSessionComplete();
			} else {
				setCurrentCardIndex(nextIndex);
				setShowAnswer(false);
				setShowCodeEditor(false);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to submit review');
		}
	};

	const handleFlipCard = () => {
		setShowAnswer(true);
	};

	const handleSkipCard = () => {
		const nextIndex = currentCardIndex + 1;
		if (nextIndex >= dueCards.length) {
			onSessionComplete();
		} else {
			setCurrentCardIndex(nextIndex);
			setShowAnswer(false);
			setShowCodeEditor(false);
		}
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'Easy': return 'text-emerald-400 border-emerald-800/50 bg-emerald-900/20';
			case 'Medium': return 'text-amber-400 border-amber-800/50 bg-amber-900/20';
			case 'Hard': return 'text-red-400 border-red-800/50 bg-red-900/20';
			default: return 'text-gray-400 border-gray-800/50 bg-gray-900/20';
		}
	};

	// Keyboard shortcuts for study session
	const { shortcuts } = useKeyboardShortcuts({
		shortcuts: {
			' ': {
				handler: () => !showAnswer && handleFlipCard(),
				description: 'Show answer',
				category: 'Study Session'
			},
			'enter': {
				handler: () => !showAnswer && handleFlipCard(),
				description: 'Show answer',
				category: 'Study Session'
			},
			'k': {
				handler: handleSkipCard,
				description: 'Skip current card',
				category: 'Study Session'
			},
			'q': {
				handler: onSessionComplete,
				description: 'End study session',
				category: 'Study Session'
			},
			'e': {
				handler: () => showAnswer && currentCard?.codeTemplate && setShowCodeEditor(!showCodeEditor),
				description: 'Toggle code editor',
				category: 'Study Session'
			},
			'?': {
				handler: () => setShowKeyboardHelp(true),
				description: 'Show keyboard shortcuts',
				category: 'Help'
			},
			'escape': {
				handler: () => showKeyboardHelp && setShowKeyboardHelp(false),
				description: 'Close help overlay',
				category: 'General'
			}
		}
	});

	if (loading) {
		return (
			<div className="min-h-[400px] flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-blue-400 border-t-transparent animate-spin mx-auto mb-4" />
					<p className="text-gray-400">Loading study session...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[400px] flex items-center justify-center">
				<div className="text-center max-w-md">
					<div className="w-12 h-12 bg-red-900/50 border border-red-800 flex items-center justify-center mx-auto mb-4">
						<Target className="w-6 h-6 text-red-400" />
					</div>
					<h3 className="text-xl font-semibold text-white mb-2">Study Session Error</h3>
					<p className="text-gray-400 mb-4">{error}</p>
					<button
						onClick={fetchDueCards}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (dueCards.length === 0) {
		return (
			<div className="min-h-[400px] flex items-center justify-center">
				<div className="text-center max-w-md">
					<div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-4">
						<CheckCircle className="w-8 h-8 text-emerald-400" />
					</div>
					<h3 className="text-2xl font-semibold text-white mb-2">All caught up!</h3>
					<p className="text-gray-400 mb-4">
						No cards are due for review in "{folderName}". Great job! 🎉
					</p>
					<button
						onClick={onSessionComplete}
						className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
					>
						Finish Session
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Session Progress - Mobile optimized */}
			<div
				className="bg-gray-900/50 border border-gray-800 p-3 sm:p-4 rounded-lg"
				style={{
					opacity: mounted ? 1 : 0,
					transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
					transition: 'all 0.2s ease-out',
				}}
			>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-2">
					<h2 className="text-base sm:text-lg font-semibold text-white truncate">
						Studying: {folderName}
					</h2>
					<div className="flex items-center gap-3 sm:gap-4 text-sm text-gray-400">
						<div className="flex items-center gap-1">
							<Clock className="w-4 h-4 flex-shrink-0" />
							<span>{Math.round((Date.now() - sessionStartTime.getTime()) / 1000 / 60)}min</span>
						</div>
						<div className="flex items-center gap-1">
							<TrendingUp className="w-4 h-4 flex-shrink-0" />
							<span>{correctCount}/{reviewedCards.length}</span>
						</div>
					</div>
				</div>
				
				<div className="flex items-center gap-4">
					<div className="flex-1 bg-gray-800 h-2 overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
							style={{
								width: `${((currentCardIndex + 1) / dueCards.length) * 100}%`,
							}}
						/>
					</div>
					<span className="text-sm text-gray-400 font-mono">
						{currentCardIndex + 1} / {dueCards.length}
					</span>
				</div>
			</div>

			{/* Current Card */}
			{currentCard && (
				<div
					className="bg-gray-900/30 border border-gray-800 p-8 min-h-[400px] backdrop-blur-sm"
					style={{
						opacity: mounted ? 1 : 0,
						transform: mounted ? 'translateY(0)' : 'translateY(10px)',
						transition: 'all 0.2s ease-out',
						transitionDelay: '50ms',
					}}
				>
					{/* Card Header */}
					<div className="flex items-center justify-between mb-8">
						<div className="px-3 py-1 bg-gray-800/80 border border-gray-700 text-gray-300 text-sm">
							{currentCard.category}
						</div>
						<div className={`px-3 py-1 border text-sm ${getDifficultyColor(currentCard.difficulty)}`}>
							{currentCard.difficulty}
						</div>
					</div>

					{/* Question */}
					{!showAnswer && (
						<div className="text-center space-y-8">
							<div className="w-12 h-12 bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto">
								<BookOpen className="w-6 h-6 text-gray-400" />
							</div>
							<h3 className="text-2xl font-semibold text-white leading-relaxed">
								{currentCard.question}
							</h3>
							<button
								onClick={handleFlipCard}
								className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
							>
								<span>Show Answer</span>
								<ArrowRight className="w-4 h-4" />
							</button>
						</div>
					)}

					{/* Answer */}
					{showAnswer && (
						<div className="space-y-8">
							<div className="w-12 h-12 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center">
								<CheckCircle className="w-6 h-6 text-emerald-400" />
							</div>
							
							<div>
								<h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
									<span className="w-2 h-2 bg-emerald-500" />
									Answer
								</h4>
								<div className="bg-gray-800/50 border border-gray-700 p-6">
									<p className="text-gray-300 leading-relaxed">
										{currentCard.answer}
									</p>
								</div>
							</div>

							{currentCard.codeTemplate && (
								<CodeEditor
									codeTemplate={currentCard.codeTemplate}
									showEditor={showCodeEditor}
									onToggleEditor={() => setShowCodeEditor(!showCodeEditor)}
									mounted={mounted}
								/>
							)}
						</div>
					)}
				</div>
			)}

			{/* Review Buttons */}
			{showAnswer && currentCard && (
				<div
					style={{
						opacity: mounted ? 1 : 0,
						transform: mounted ? 'translateY(0)' : 'translateY(10px)',
						transition: 'all 0.2s ease-out',
						transitionDelay: '100ms',
					}}
				>
					<ReviewButtons
						onReview={handleReview}
						startTime={cardStartTime}
						mounted={mounted}
					/>
				</div>
			)}

			{/* Session Controls */}
			<div
				className="flex items-center justify-between pt-4 border-t border-gray-800"
				style={{
					opacity: mounted ? 1 : 0,
					transform: mounted ? 'translateY(0)' : 'translateY(10px)',
					transition: 'all 0.2s ease-out',
					transitionDelay: '150ms',
				}}
			>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowKeyboardHelp(true)}
						className="px-3 py-2 text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-600"
						title="Keyboard shortcuts (?)"
					>
						<HelpCircle className="w-4 h-4" />
					</button>
					<button
						onClick={onSessionComplete}
						className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
					>
						End Session (Q)
					</button>
				</div>
				
				<button
					onClick={handleSkipCard}
					className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
				>
					Skip Card (K)
				</button>
			</div>

			{/* Keyboard Shortcuts Help */}
			<KeyboardShortcutsHelp
				isOpen={showKeyboardHelp}
				onClose={() => setShowKeyboardHelp(false)}
				shortcuts={shortcuts}
			/>
		</div>
	);
};