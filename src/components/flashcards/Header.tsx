import { FlashcardFolder } from "@/lib/types";
import { Brain, Code } from "lucide-react";

interface HeaderProps {
    mounted: boolean;
    currentFolder?: FlashcardFolder;
}

export const Header = ({ mounted, currentFolder }: HeaderProps) => {
    const fadeInUp = {
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        opacity: mounted ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    };

    const staggerDelay = (index: number) => ({
        ...fadeInUp,
        transitionDelay: `${index * 100}ms`
    });

    return (
        <div className="mb-16" style={fadeInUp}>
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center shadow-2xl"
                    style={{
                        ...staggerDelay(0),
                        animation: 'glow 3s ease-in-out infinite alternate'
                    }}
                >
                    <Brain className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent" style={staggerDelay(1)}>
                        Flashcards V1
                    </h1>
                    <div className="flex items-center gap-2 mt-1" style={staggerDelay(2)}>
                        <Code className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-400 font-medium">Interactive Learning + Code Execution</span>
                    </div>
                </div>
            </div>
            <div style={staggerDelay(3)}>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Currently studying:</span>
                    <span className="text-blue-400 font-medium">
                        {currentFolder?.name || "No folder selected"}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500">
                        {currentFolder?.flashcards?.length || 0} flashcards
                    </span>
                </div>
            </div>
        </div>
    );
};