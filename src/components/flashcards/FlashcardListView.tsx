import React, { useState } from 'react';
import { Flashcard } from '@/lib/types';
import { CheckSquare, Square, BookOpen, Code2, Calendar, TrendingUp, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface FlashcardListViewProps {
  flashcards: Flashcard[];
  selectedCards: Set<string>;
  onCardSelect: (cardId: string) => void;
  onCardToggle: (cardId: string) => void;
  bulkMode: boolean;
  mounted: boolean;
}

export const FlashcardListView: React.FC<FlashcardListViewProps> = ({
  flashcards,
  selectedCards,
  onCardSelect,
  onCardToggle,
  bulkMode,
  mounted
}) => {
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());

  const toggleAnswer = (cardId: string) => {
    const newRevealed = new Set(revealedAnswers);
    if (newRevealed.has(cardId)) {
      newRevealed.delete(cardId);
    } else {
      newRevealed.add(cardId);
    }
    setRevealedAnswers(newRevealed);
  };
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400 bg-emerald-900/30 border-emerald-800/50';
      case 'Medium': return 'text-amber-400 bg-amber-900/30 border-amber-800/50';
      case 'Hard': return 'text-red-400 bg-red-900/30 border-red-800/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-800/50';
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getPerformanceColor = (correct: number, total: number) => {
    if (total === 0) return 'text-gray-400';
    const percentage = (correct / total) * 100;
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const staggerDelay = (index: number) => ({
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    opacity: mounted ? 1 : 0,
    transition: 'all 0.3s ease-out',
    transitionDelay: `${index * 50}ms`
  });

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No flashcards found</h3>
        <p className="text-gray-500">Create some flashcards to get started with your studies.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flashcards.map((card, index) => {
        const isSelected = selectedCards.has(card.id);
        const accuracy = card.totalReviews > 0 
          ? Math.round((card.correctReviews / card.totalReviews) * 100) 
          : 0;

        return (
          <div
            key={card.id}
            className={`
              bg-gray-900/30 border border-gray-800 rounded-lg p-4 transition-all duration-200 hover:border-gray-700 hover:bg-gray-900/50
              ${isSelected ? 'border-blue-500/50 bg-blue-900/20' : ''}
              ${bulkMode ? 'cursor-pointer' : ''}
            `}
            style={staggerDelay(index)}
            onClick={() => bulkMode && onCardToggle(card.id)}
          >
            <div className="flex items-start gap-4">
              {/* Selection Checkbox */}
              {bulkMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCardToggle(card.id);
                  }}
                  className="flex-shrink-0 mt-1 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Card Content */}
              <div className="flex-1 min-w-0">
                {/* Header with Category and Difficulty */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-gray-800/80 border border-gray-700 text-gray-300 text-xs">
                      {card.category}
                    </span>
                    <span className={`px-2 py-1 border text-xs ${getDifficultyColor(card.difficulty)}`}>
                      {card.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {card.codeTemplate && (
                      <div className="flex items-center gap-1">
                        <Code2 className="w-3 h-3" />
                        <span>Code</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(card.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Question Preview */}
                <div className="mb-3">
                  <h4 className="text-white font-medium text-sm mb-1">Question:</h4>
                  <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                    {card.question}
                  </p>
                </div>

                {/* Answer Preview */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium text-sm">Answer:</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAnswer(card.id);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      {revealedAnswers.has(card.id) ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          Reveal
                        </>
                      )}
                    </button>
                  </div>
                  {revealedAnswers.has(card.id) ? (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {card.answer}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      Click "Reveal" to see the answer
                    </p>
                  )}
                </div>

                {/* Performance Stats and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-4 text-xs">
                    <div className={`flex items-center gap-1 ${getPerformanceColor(card.correctReviews, card.totalReviews)}`}>
                      <TrendingUp className="w-3 h-3" />
                      <span>{accuracy}% accuracy</span>
                    </div>
                    
                    <div className="text-gray-500">
                      <span>{card.totalReviews} reviews</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Review Status */}
                    <div className="text-xs">
                      {card.isLearning ? (
                        <span className="text-blue-400 bg-blue-900/30 px-2 py-1">Learning</span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-900/30 px-2 py-1">Learned</span>
                      )}
                    </div>

                    {/* View Card Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardSelect(card.id);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 transition-colors border border-blue-800/50"
                      title="View this card in single card mode"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Card</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};