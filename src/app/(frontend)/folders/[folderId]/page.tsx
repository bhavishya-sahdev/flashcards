'use client'

import { useFlashcards } from '@/hooks/useFlashcards';
import { useFolders } from '@/hooks/useFolders';
import { BackgroundAnimation } from '@/components/flashcards/BackgroundAnimation';
import { CodeEditor } from '@/components/flashcards/CodeEditor';
import { UnifiedFlashcardModal } from '@/components/flashcards/UnifiedFlashcardModal';
import { FlashcardDisplay } from '@/components/flashcards/FlashcardsDisplay';
import { FlashcardListView } from '@/components/flashcards/FlashcardListView';
import { BulkManagementToolbar } from '@/components/flashcards/BulkManagementToolbar';
import { BulkConfirmDialog } from '@/components/flashcards/BulkConfirmDialog';
import { GlobalStyles } from '@/components/flashcards/GlobalStyles';
import { Navigation } from '@/components/flashcards/Navigation';
import { StudyGuide } from '@/components/flashcards/StudyGuide';
import { StudySession } from '@/components/flashcards/StudySession';
import { StudyStats } from '@/components/flashcards/StudyStats';
import { DueCardsOverview } from '@/components/flashcards/DueCardsOverview';
import { ErrorNotification } from '@/components/flashcards/ErrorNotification';
import { KeyboardShortcutsHelp } from '@/components/flashcards/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { FolderDashboardHeader } from '@/components/flashcards/dashboard/FolderDashboardHeader';
import { DashboardCard } from '@/components/flashcards/dashboard/DashboardCard';
import { useSession } from '@/lib/auth-client';
import { Flashcard } from '@/lib/types';
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ArrowLeft, Brain, Code, BookOpen, Target, BarChart3, Eye, Lock, Plus, HelpCircle, CheckSquare, Download, List, Square, Sparkles } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const FlashcardFolderPage = () => {
    const params = useParams<{ folderId: string }>();
    const folderId = params.folderId as string;
    const { data } = useSession();

    const {
        folders,
        loading: foldersLoading,
        error: foldersError,
        createFlashcard,
    } = useFolders();

    const [errorMessage, setErrorMessage] = useState<string>('');
    const [mounted, setMounted] = useState(false);
    const [studyMode, setStudyMode] = useState<'study' | 'browse' | 'analytics'>('study');
    const [showStudySession, setShowStudySession] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

    // View mode state (list view is now default)
    const [viewMode, setViewMode] = useState<'list' | 'single'>('list');
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const [bulkOperation, setBulkOperation] = useState<{
        type: 'delete' | 'duplicate' | 'move' | 'edit';
        data?: any;
    }>({ type: 'delete' });

    // Reset to browse mode if user logs out while in protected modes
    useEffect(() => {
        if (!data && (studyMode === 'study' || studyMode === 'analytics')) {
            setStudyMode('browse');
        }
    }, [data, studyMode]);

    // Clear selected cards when switching away from browse mode
    useEffect(() => {
        if (studyMode !== 'browse') {
            setSelectedCards(new Set());
        }
    }, [studyMode]);

    // Swipe gestures for mobile navigation
    const { elementRef: swipeRef } = useSwipeGestures({
        onSwipeLeft: () => studyMode === 'browse' && viewMode === 'single' && currentFlashcards.length > 0 && nextCard(),
        onSwipeRight: () => studyMode === 'browse' && viewMode === 'single' && currentFlashcards.length > 0 && prevCard(),
        onSwipeUp: () => studyMode === 'browse' && viewMode === 'single' && currentFlashcards.length > 0 && flipCard(),
    }, {
        threshold: 50,
        velocity: 0.3
    });

    // Keyboard shortcuts
    const { shortcuts } = useKeyboardShortcuts({
        shortcuts: {
            // Navigation
            'arrowleft': {
                handler: () => studyMode === 'browse' && currentFlashcards.length > 0 && prevCard(),
                description: 'Previous card',
                category: 'Navigation'
            },
            'h': {
                handler: () => studyMode === 'browse' && currentFlashcards.length > 0 && prevCard(),
                description: 'Previous card (vim-style)',
                category: 'Navigation'
            },
            'arrowright': {
                handler: () => studyMode === 'browse' && currentFlashcards.length > 0 && nextCard(),
                description: 'Next card',
                category: 'Navigation'
            },
            'l': {
                handler: () => studyMode === 'browse' && currentFlashcards.length > 0 && nextCard(),
                description: 'Next card (vim-style)',
                category: 'Navigation'
            },
            ' ': {
                handler: () => studyMode === 'browse' && currentFlashcards.length > 0 && flipCard(),
                description: 'Flip card / Show answer',
                category: 'Navigation'
            },
            'enter': {
                handler: () => studyMode === 'browse' && currentFlashcards.length > 0 && flipCard(),
                description: 'Flip card / Show answer',
                category: 'Navigation'
            },
            'r': {
                handler: () => studyMode === 'browse' && currentFlashcards.length > 0 && resetProgress(),
                description: 'Reset progress',
                category: 'Navigation'
            },
            // Mode switching
            's': {
                handler: () => data && setStudyMode('study'),
                description: 'Study mode',
                category: 'Modes'
            },
            'b': {
                handler: () => setStudyMode('browse'),
                description: 'Browse mode',
                category: 'Modes'
            },
            'a': {
                handler: () => data && setStudyMode('analytics'),
                description: 'Analytics mode',
                category: 'Modes'
            },
            // Actions
            'n': {
                handler: () => setShowCreateModal(true),
                description: 'New flashcard',
                category: 'Actions'
            },
            'e': {
                handler: () => studyMode === 'browse' && showAnswer && currentCardData?.codeTemplate && toggleCodeEditor(),
                description: 'Toggle code editor',
                category: 'Actions'
            },
            '?': {
                handler: () => setShowKeyboardHelp(true),
                description: 'Show keyboard shortcuts',
                category: 'Help'
            },
            'escape': {
                handler: () => {
                    if (showKeyboardHelp) {
                        setShowKeyboardHelp(false);
                    } else if (showCreateModal) {
                        setShowCreateModal(false);
                    } else if (viewMode === 'list' && selectedCards.size > 0) {
                        setSelectedCards(new Set());
                    } else if (viewMode === 'single') {
                        setViewMode('list');
                    }
                },
                description: 'Close modals/overlays or return to list view',
                category: 'General'
            },
            // View mode shortcuts
            'v': {
                handler: () => studyMode === 'browse' && setViewMode(viewMode === 'list' ? 'single' : 'list'),
                description: 'Toggle between list and single card view',
                category: 'View'
            },
            'ctrl+a': {
                handler: () => {
                    if (viewMode === 'list') {
                        setSelectedCards(new Set(currentFlashcards.map(card => card.id)));
                    }
                },
                description: 'Select all cards (in list view)',
                category: 'Selection'
            },
            'ctrl+d': {
                handler: () => {
                    if (viewMode === 'list' && selectedCards.size > 0) {
                        setSelectedCards(new Set());
                    }
                },
                description: 'Deselect all cards (in list view)',
                category: 'Selection'
            }
        },
        enabled: !showStudySession // Disable when in study session (it has its own shortcuts)
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Find the current folder
    const currentFolder = folders.find(f => f.id === folderId);
    const currentFlashcards = currentFolder?.flashcards || [];

    const {
        currentCard,
        showAnswer,
        studiedCards,
        isFlipping,
        isRevealing,
        showCodeEditor,
        progress,
        currentCardData,
        nextCard,
        prevCard,
        flipCard,
        resetProgress,
        toggleCodeEditor,
        goToCard
    } = useFlashcards(currentFlashcards);

    const handleCreateFlashcard = async (flashcardData: Pick<Flashcard, 'question' | 'answer' | 'category' | 'difficulty' | 'codeTemplate'>) => {
        if (!currentFolder) return;

        try {
            await createFlashcard(flashcardData, currentFolder.id);
        } catch (error) {
            setErrorMessage('Failed to create flashcard. Please try again.');
        }
    };

    const handleGeneratedCards = async (generatedCards: any[]) => {
        if (!currentFolder) return;

        try {
            // Create each generated card
            for (const cardData of generatedCards) {
                await createFlashcard(cardData, currentFolder.id);
            }
            // Flashcards created successfully
        } catch (error) {
            setErrorMessage('Failed to create generated flashcards. Please try again.');
        }
    };

    // Bulk operation handlers
    const handleBulkDelete = () => {
        setBulkOperation({ type: 'delete' });
        setShowBulkConfirm(true);
    };

    const handleBulkDuplicate = () => {
        setBulkOperation({ type: 'duplicate' });
        setShowBulkConfirm(true);
    };

    const handleBulkMove = (targetFolderId: string) => {
        const targetFolder = folders.find(f => f.id === targetFolderId);
        setBulkOperation({
            type: 'move',
            data: { targetFolderId, targetFolderName: targetFolder?.name }
        });
        setShowBulkConfirm(true);
    };

    const handleBulkEdit = (updates: Partial<Flashcard>) => {
        const editField = Object.keys(updates)[0];
        const editValue = updates[editField as keyof Flashcard];
        setBulkOperation({
            type: 'edit',
            data: { updates, editField, editValue }
        });
        setShowBulkConfirm(true);
    };

    const handleBulkExport = () => {
        // TODO: Implement CSV export
        console.log('Exporting cards:', Array.from(selectedCards));
        setErrorMessage('Export functionality coming soon!');
    };

    const executeBulkOperation = async () => {
        const cardIds = Array.from(selectedCards);

        try {
            const response = await fetch('/api/flashcard/bulk', {
                method: bulkOperation.type === 'delete' ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardIds,
                    operation: bulkOperation.type,
                    data: bulkOperation.data
                })
            });

            if (!response.ok) {
                throw new Error('Failed to perform bulk operation');
            }

            const result = await response.json();
            console.log('Bulk operation result:', result);

            // Reset selection
            setSelectedCards(new Set());

            // Force refresh folders to see updated data
            window.location.reload();

        } catch (error) {
            console.error('Bulk operation error:', error);
            setErrorMessage('Failed to perform bulk operation. Please try again.');
        }
    };

    // Bulk selection helpers
    const handleSelectAll = () => {
        setSelectedCards(new Set(currentFlashcards.map(card => card.id)));
    };

    const handleSelectNone = () => {
        setSelectedCards(new Set());
    };

    const handleCardToggle = (cardId: string) => {
        const newSelected = new Set(selectedCards);
        if (newSelected.has(cardId)) {
            newSelected.delete(cardId);
        } else {
            newSelected.add(cardId);
        }
        setSelectedCards(newSelected);
    };

    const staggerDelay = (index: number) => ({
        transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        opacity: mounted ? 1 : 0,
        transition: 'all 0.2s ease-out',
        transitionDelay: `${index * 40}ms`
    });

    // Loading state
    if (foldersLoading) {
        return (
            <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                    <p className="text-gray-400">Loading flashcards...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (foldersError) {
        return (
            <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                    <p className="text-gray-400 mb-4">{foldersError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Folder not found
    if (!currentFolder && !foldersLoading) {
        return (
            <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
                <div className="text-center max-w-md">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Folder not found</h2>
                    <p className="text-gray-400 mb-4">The folder you're looking for doesn't exist or you don't have access to it.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Folders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <GlobalStyles />
            <BackgroundAnimation />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8" ref={swipeRef}>
                {/* Dashboard Header */}
                {currentFolder && (
                    <FolderDashboardHeader
                        folder={currentFolder}
                        onCreateCard={() => setShowCreateModal(true)}
                        className="mb-8"
                    />
                )}

                {/* Mode Tabs */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-1 bg-gray-900/50 border border-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => data ? setStudyMode('study') : null}
                                className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 rounded-md ${studyMode === 'study'
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                                    : data
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        : 'text-gray-600 cursor-not-allowed opacity-60'
                                    }`}
                                disabled={!data}
                            >
                                <Target className="w-4 h-4" />
                                <span>Study</span>
                                {!data && <Lock className="w-3 h-3" />}
                            </button>
                            <button
                                onClick={() => setStudyMode('browse')}
                                className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 rounded-md ${studyMode === 'browse'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                <Eye className="w-4 h-4" />
                                <span>Browse</span>
                            </button>
                            <button
                                onClick={() => data ? setStudyMode('analytics') : null}
                                className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 rounded-md ${studyMode === 'analytics'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : data
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        : 'text-gray-600 cursor-not-allowed opacity-60'
                                    }`}
                                disabled={!data}
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>Analytics</span>
                                {!data && <Lock className="w-3 h-3" />}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {studyMode === 'browse' && currentFlashcards.length > 0 && (
                                <button
                                    onClick={() => setViewMode(viewMode === 'list' ? 'single' : 'list')}
                                    className={`flex items-center gap-2 px-3 py-2 border transition-colors text-sm ${viewMode === 'single'
                                        ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                                        : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                                        }`}
                                    title="Toggle view mode (V)"
                                >
                                    {viewMode === 'list' ? <Square className="w-4 h-4" /> : <List className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{viewMode === 'list' ? 'Single' : 'List'}</span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowKeyboardHelp(true)}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm"
                                title="Keyboard shortcuts (?)"
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Help</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Study Mode - Spaced Repetition (Default/Primary) */}
                {studyMode === 'study' && (
                    <DashboardCard title="Study Session" icon={Target} iconColor="text-emerald-400">
                        {!data ? (
                            // Authentication Required Message
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-6">
                                    <Lock className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-4">
                                    Sign in to start studying
                                </h3>
                                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                    Track your learning progress, get personalized study schedules, and boost your retention with our advanced spaced repetition algorithm.
                                </p>
                                <div className="mt-8 pt-6 border-t border-gray-800">
                                    <p className="text-sm text-gray-500 mb-4">What you'll unlock:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                        <div className="text-center">
                                            <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Spaced Repetition</p>
                                        </div>
                                        <div className="text-center">
                                            <BarChart3 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Progress Tracking</p>
                                        </div>
                                        <div className="text-center">
                                            <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Smart Scheduling</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : showStudySession ? (
                            <StudySession
                                folderId={folderId}
                                onSessionComplete={() => {
                                    setShowStudySession(false);
                                    // Could show a completion message or stats here
                                }}
                                mounted={mounted}
                            />
                        ) : (
                            <DueCardsOverview
                                folderId={folderId}
                                onStartStudySession={() => setShowStudySession(true)}
                                mounted={mounted}
                            />
                        )}
                    </DashboardCard>
                )}

                {/* Browse Mode - List View or Single Card View */}
                {studyMode === 'browse' && (
                    <DashboardCard
                        title={viewMode === 'list' ? 'Flashcard Library' : `Card ${currentCard + 1} of ${currentFlashcards.length}`}
                        icon={BookOpen}
                        iconColor="text-blue-400"
                        headerActions={
                            viewMode === 'single' && currentFlashcards.length > 0 && (
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-400">Progress:</span>
                                    <span className="text-white font-mono">{Math.round(progress)}%</span>
                                    <span className="text-emerald-400">{studiedCards.size} studied</span>
                                </div>
                            )
                        }
                    >
                        {viewMode === 'list' ? (
                            // List View - Default view with bulk management capabilities
                            <FlashcardListView
                                flashcards={currentFlashcards}
                                selectedCards={selectedCards}
                                onCardSelect={(cardId) => {
                                    // Switch to single card view for the selected card
                                    const cardIndex = currentFlashcards.findIndex(card => card.id === cardId);
                                    if (cardIndex !== -1) {
                                        goToCard(cardIndex);
                                        setViewMode('single');
                                    }
                                }}
                                onCardToggle={handleCardToggle}
                                bulkMode={true}
                                mounted={mounted}
                            />
                        ) : (
                            // Single Card View
                            <div className="space-y-6">
                                <FlashcardDisplay
                                    card={currentCardData}
                                    showAnswer={showAnswer}
                                    isStudied={studiedCards.has(currentCard)}
                                    isFlipping={isFlipping}
                                    isRevealing={isRevealing}
                                    mounted={mounted}
                                    onFlip={flipCard}
                                />

                                {showAnswer && currentCardData && (
                                    <CodeEditor
                                        codeTemplate={currentCardData.codeTemplate}
                                        showEditor={showCodeEditor}
                                        onToggleEditor={toggleCodeEditor}
                                        mounted={mounted}
                                    />
                                )}

                                <Navigation
                                    onPrevious={prevCard}
                                    onNext={nextCard}
                                    onFlipCard={flipCard}
                                    onReset={resetProgress}
                                    showAnswer={showAnswer}
                                    mounted={mounted}
                                    hasCards={currentFlashcards.length > 0}
                                />

                                {/* Progress Bar for Single Card View */}
                                {currentFlashcards.length > 0 && (
                                    <div className="bg-gray-800/30 border border-gray-700 p-4 rounded-lg">
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 rounded-full"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-center">
                                            <p className="text-xs text-gray-500">
                                                💡 Use arrow keys or swipe to navigate, space/enter to flip
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <StudyGuide mounted={mounted} />
                            </div>
                        )}
                    </DashboardCard>
                )}

                {/* Analytics Mode */}
                {studyMode === 'analytics' && (
                    <DashboardCard title="Analytics" icon={BarChart3} iconColor="text-purple-400">
                        {!data ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-purple-900/50 border border-purple-800 flex items-center justify-center mx-auto mb-6">
                                    <BarChart3 className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-4">
                                    Sign in to view analytics
                                </h3>
                                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                    Track your learning progress, accuracy rates, streaks, and detailed performance analytics.
                                </p>
                            </div>
                        ) : (
                            <StudyStats folderId={folderId} />
                        )}
                    </DashboardCard>
                )}


                {/* Unified Flashcard Creation Modal */}
                {currentFolder && (
                    <UnifiedFlashcardModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        folderId={currentFolder.id}
                        onCreateFlashcard={(flashcard) => {
                            handleCreateFlashcard(flashcard);
                        }}
                        onCardsGenerated={handleGeneratedCards}
                        mounted={mounted}
                    />
                )}

                {errorMessage && (
                    <ErrorNotification
                        message={errorMessage}
                        onClose={() => setErrorMessage('')}
                    />
                )}

                {/* Bulk Management Toolbar - Shows when in list view and cards are selected */}
                {viewMode === 'list' && selectedCards.size > 0 && (
                    <BulkManagementToolbar
                        selectedCards={selectedCards}
                        totalCards={currentFlashcards.length}
                        onSelectAll={handleSelectAll}
                        onSelectNone={handleSelectNone}
                        onBulkDelete={handleBulkDelete}
                        onBulkDuplicate={handleBulkDuplicate}
                        onBulkMove={handleBulkMove}
                        onBulkEdit={handleBulkEdit}
                        onExport={handleBulkExport}
                        onClose={() => {
                            setSelectedCards(new Set());
                        }}
                        folders={folders.map(f => ({ id: f.id, name: f.name }))}
                        currentFolderId={folderId}
                    />
                )}

                {/* Bulk Confirmation Dialog */}
                <BulkConfirmDialog
                    isOpen={showBulkConfirm}
                    onClose={() => setShowBulkConfirm(false)}
                    onConfirm={executeBulkOperation}
                    operation={bulkOperation.type}
                    selectedCount={selectedCards.size}
                    targetFolderName={bulkOperation.data?.targetFolderName}
                    editField={bulkOperation.data?.editField}
                    editValue={bulkOperation.data?.editValue}
                />

                {/* Keyboard Shortcuts Help */}
                <KeyboardShortcutsHelp
                    isOpen={showKeyboardHelp}
                    onClose={() => setShowKeyboardHelp(false)}
                    shortcuts={shortcuts}
                />
            </div>
        </div>
    );
};

export default FlashcardFolderPage;