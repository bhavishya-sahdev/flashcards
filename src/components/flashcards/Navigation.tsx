import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface NavigationProps {
    onPrevious: () => void;
    onNext: () => void;
    onFlipCard: () => void;
    onReset: () => void;
    showAnswer: boolean;
    mounted: boolean;
    hasCards: boolean;
}

export const Navigation = ({
    onPrevious,
    onNext,
    onFlipCard,
    onReset,
    showAnswer,
    mounted,
    hasCards
}: NavigationProps) => {
    const staggerDelay = (index: number) => ({
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        opacity: mounted ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${index * 100}ms`
    });

    if (!hasCards) {
        return null;
    }

    return (
        <>
            {/* Responsive Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16" style={staggerDelay(7)}>
                {/* Previous Button */}
                <button
                    onClick={onPrevious}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-all duration-200 text-sm font-medium group min-h-[48px] sm:min-h-0 rounded-lg sm:rounded order-2 sm:order-1"
                >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform duration-200 flex-shrink-0" />
                    <span className="sm:hidden">Previous</span>
                    <span className="hidden sm:inline">Previous</span>
                    <span className="hidden lg:inline text-xs opacity-50">(←)</span>
                </button>

                {/* Flip Button - center on desktop, top on mobile */}
                <button
                    onClick={onFlipCard}
                    className="w-full sm:w-auto order-1 sm:order-2 px-6 sm:px-8 py-4 sm:py-3 bg-white text-black hover:bg-gray-100 transition-all duration-200 text-base sm:text-sm font-medium shadow-lg hover:shadow-xl active:scale-95 sm:transform sm:hover:scale-105 min-h-[52px] sm:min-h-0 rounded-lg sm:rounded"
                >
                    <span>{showAnswer ? 'Hide Answer' : 'Reveal Answer'}</span>
                    <span className="hidden sm:inline ml-2 text-xs opacity-70">(Space)</span>
                </button>

                {/* Next Button */}
                <button
                    onClick={onNext}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-all duration-200 text-sm font-medium group min-h-[48px] sm:min-h-0 rounded-lg sm:rounded order-3"
                >
                    <span className="sm:hidden">Next</span>
                    <span className="hidden sm:inline">Next</span>
                    <span className="hidden lg:inline text-xs opacity-50">(→)</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform duration-200 flex-shrink-0" />
                </button>
            </div>

            {/* Reset Action */}
            <div className="flex justify-center mb-12 sm:mb-16" style={staggerDelay(8)}>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2.5 sm:py-2 text-gray-500 hover:text-gray-300 transition-all duration-200 text-sm group min-h-[44px] sm:min-h-0 rounded-lg border border-gray-800 hover:border-gray-700 sm:border-transparent sm:hover:border-transparent"
                >
                    <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300 flex-shrink-0" />
                    <span>Reset progress</span>
                    <span className="hidden sm:inline ml-1 text-xs opacity-50">(R)</span>
                </button>
            </div>
        </>
    );
};