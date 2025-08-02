import { Flashcard } from "@/lib/types";
import { ArrowRight, BookOpen, CheckCircle } from "lucide-react";

interface FlashcardDisplayProps {
  card: Flashcard;
  showAnswer: boolean;
  isStudied: boolean;
  isFlipping: boolean;
  isRevealing: boolean;
  mounted: boolean;
  onFlip: () => void;
}

export const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  card,
  showAnswer,
  isStudied,
  isFlipping,
  isRevealing,
  mounted,
  onFlip
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400 border-emerald-800/50 bg-emerald-900/20';
      case 'Medium': return 'text-amber-400 border-amber-800/50 bg-amber-900/20';
      case 'Hard': return 'text-red-400 border-red-800/50 bg-red-900/20';
      default: return 'text-gray-400 border-gray-800/50 bg-gray-900/20';
    }
  };

  const cardFlipStyle = {
    transform: isFlipping ? 'scale(0.95) rotateX(10deg)' : 'scale(1) rotateX(0deg)',
    opacity: isFlipping ? 0.7 : 1,
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  };

  const questionCardStyle = {
    transform: isRevealing ? 'translateX(-100%) rotateY(-90deg)' : 'translateX(0) rotateY(0deg)',
    opacity: isRevealing ? 0 : (showAnswer ? 0 : 1),
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: showAnswer ? 'absolute' as const : 'relative' as const,
    zIndex: showAnswer ? 1 : 2
  };

  const answerCardStyle = {
    transform: showAnswer ? 'translateX(0) rotateY(0deg)' : 'translateX(100%) rotateY(90deg)',
    opacity: showAnswer ? 1 : 0,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: showAnswer ? '200ms' : '0ms',
    position: showAnswer ? 'relative' as const : 'absolute' as const,
    zIndex: showAnswer ? 2 : 1
  };

  if (!card) {
    return (
      <div className="mb-12 border border-gray-800 p-10 min-h-[480px] bg-gray-900/30 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-400 mb-2">No flashcards in this folder</h2>
          <p className="text-gray-500">Add some flashcards to get started with your studies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div
        className="relative border border-gray-800 p-10 min-h-[480px] cursor-pointer transition-all duration-300 hover:border-gray-700 hover:shadow-2xl group bg-gray-900/30 backdrop-blur-sm overflow-hidden"
        onClick={onFlip}
        style={cardFlipStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-10">
          <div
            className="px-4 py-2 bg-gray-800/80 border border-gray-700 text-gray-300 text-sm font-medium"
            style={{
              transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
              opacity: mounted ? 1 : 0,
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '400ms'
            }}
          >
            {card.category}
          </div>
          <div
            className={`px-4 py-2 border text-sm font-medium ${getDifficultyColor(card.difficulty)}`}
            style={{
              transform: mounted ? 'translateX(0)' : 'translateX(20px)',
              opacity: mounted ? 1 : 0,
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '500ms'
            }}
          >
            {card.difficulty}
          </div>
        </div>

        {/* Card Content Container */}
        <div className="relative flex flex-col justify-center min-h-[320px] overflow-hidden">
          {/* Question Card */}
          <div className="w-full" style={questionCardStyle}>
            <div className="text-center">
              <div className="mb-8">
                <div
                  className="w-16 h-16 bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    animation: mounted ? 'pulse 2s ease-in-out infinite' : 'none'
                  }}
                >
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-white mb-10 leading-relaxed max-w-4xl mx-auto">
                {card.question}
              </h2>
              <div
                className="flex items-center justify-center gap-3 text-gray-500 group-hover:text-gray-400 transition-colors duration-200"
                style={{
                  animation: 'bounce 2s ease-in-out infinite'
                }}
              >
                <span className="text-sm font-medium">Click anywhere to reveal answer</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Answer Card */}
          <div className="w-full" style={answerCardStyle}>
            <div>
              <div className="mb-8">
                <div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mb-8">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500" />
                  Solution
                </h3>
                <div className="border border-gray-700 p-8 bg-gray-800/50">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {card.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Indicator */}
        {isStudied && (
          <div
            className="absolute top-6 right-6 w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg"
            style={{
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div className="w-2 h-2 bg-white" />
          </div>
        )}
      </div>
    </div>
  );
};