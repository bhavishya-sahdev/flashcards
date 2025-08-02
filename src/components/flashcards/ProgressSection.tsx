import { Target } from "lucide-react";

interface ProgressSectionProps {
    progress: number;
    currentCard: number;
    totalCards: number;
    studiedCount: number;
    mounted: boolean;
}

export const ProgressSection = ({
    progress,
    currentCard,
    totalCards,
    studiedCount,
    mounted
}: ProgressSectionProps) => {
    const staggerDelay = (index: number) => ({
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        opacity: mounted ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${index * 100}ms`
    });

    if (totalCards === 0) {
        return null;
    }

    return (
        <div
            className="mb-12 p-8 border border-gray-800 bg-gray-900/50 backdrop-blur-sm"
            style={staggerDelay(4)}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-semibold text-white">Learning Progress</span>
                        <div className="text-sm text-gray-400">Track your mastery journey</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                        {Math.round(progress)}%
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        {currentCard + 1} of {totalCards}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="h-3 bg-gray-800 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm"
                        style={{
                            width: `${progress}%`,
                            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500" />
                    <span>{studiedCount} completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-600" />
                    <span>{totalCards - studiedCount} remaining</span>
                </div>
            </div>
        </div>
    );
};