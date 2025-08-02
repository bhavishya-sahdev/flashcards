import { Clock } from "lucide-react";

interface StudyGuideProps {
    mounted: boolean;
}

export const StudyGuide = ({ mounted }: StudyGuideProps) => {
    const staggerDelay = (index: number) => ({
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        opacity: mounted ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${index * 100}ms`
    });

    return (
        <div
            className="border border-gray-800 p-8 bg-gray-900/30 backdrop-blur-sm"
            style={staggerDelay(9)}
        >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                </div>
                Study effectively
            </h3>
            <div className="grid md:grid-cols-2 gap-8 text-gray-400 leading-relaxed">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 mt-2 flex-shrink-0" />
                        <span>Organize flashcards into folders by topic or difficulty</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 mt-2 flex-shrink-0" />
                        <span>Practice coding implementations in the live editor</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 mt-2 flex-shrink-0" />
                        <span>Experiment with different approaches and optimizations</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 mt-2 flex-shrink-0" />
                        <span>Focus deeply on understanding time complexity reasoning</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
