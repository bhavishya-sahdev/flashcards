import { Flashcard } from "@/lib/types";
import { Code2, HelpCircle, Lightbulb, Plus, Save, X } from "lucide-react";
import { useState } from "react";

// Create a type for the minimal flashcard data needed for creation
type FlashcardCreationData = Pick<Flashcard, 'question' | 'answer' | 'category' | 'difficulty' | 'codeTemplate'>;

export const FlashcardCreator: React.FC<{
    onCreateFlashcard: (flashcard: FlashcardCreationData) => void;
    mounted: boolean;
    onCancel?: () => void;
}> = ({ onCreateFlashcard, mounted, onCancel }) => {
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '',
        difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
        codeTemplate: ''
    });
    const [activeTab, setActiveTab] = useState<'question' | 'answer' | 'code'>('question');

    const handleSubmit = () => {
        if (formData.question.trim() && formData.answer.trim() && formData.category.trim()) {
            onCreateFlashcard({
                question: formData.question.trim(),
                answer: formData.answer.trim(),
                category: formData.category.trim(),
                difficulty: formData.difficulty,
                codeTemplate: formData.codeTemplate.trim() || getDefaultCodeTemplate()
            });

            // Reset form
            setFormData({
                question: '',
                answer: '',
                category: '',
                difficulty: 'Medium',
                codeTemplate: ''
            });
            setActiveTab('question');
        }
    };

    const handleCancel = () => {
        setFormData({
            question: '',
            answer: '',
            category: '',
            difficulty: 'Medium',
            codeTemplate: ''
        });
        setActiveTab('question');
        onCancel?.();
    };

    const getDefaultCodeTemplate = () => {
        return `// Implement your solution here
function solution() {
    // Your code goes here
    console.log("Hello, World!");
}

// Test your implementation
solution();`;
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'border-emerald-600 bg-emerald-900/20 text-emerald-400';
            case 'Medium': return 'border-amber-600 bg-amber-900/20 text-amber-400';
            case 'Hard': return 'border-red-600 bg-red-900/20 text-red-400';
            default: return 'border-gray-600 bg-gray-900/20 text-gray-400';
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Create New Flashcard</h3>
                            <div className="text-sm text-gray-400">Fill in the details for your new flashcard</div>
                        </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Header - Category and Difficulty */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-gray-600 focus:outline-none"
                            placeholder="e.g., Arrays, Trees, Dynamic Programming..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
                        <div className="flex gap-2">
                            {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setFormData({ ...formData, difficulty: level })}
                                    className={`px-4 py-3 border text-sm font-medium transition-all duration-200 ${formData.difficulty === level
                                        ? getDifficultyColor(level)
                                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mb-6 border-b border-gray-800">
                    {[
                        { id: 'question', label: 'Question', icon: HelpCircle, shortcut: '1' },
                        { id: 'answer', label: 'Answer', icon: Lightbulb, shortcut: '2' },
                        { id: 'code', label: 'Code Template', icon: Code2, shortcut: '3' }
                    ].map(({ id, label, icon: Icon, shortcut }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === id
                                ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                            <span className="ml-auto text-xs opacity-50">({shortcut})</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'question' && (
                        <div>
                            <label className="block text-sm text-gray-300 mb-3">
                                Question <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-gray-600 focus:outline-none h-32 resize-none"
                                placeholder="Enter your question here... Be specific and clear about what you're asking."
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                Example: "What is the time complexity of inserting an element at the beginning of an array?"
                            </div>
                        </div>
                    )}

                    {activeTab === 'answer' && (
                        <div>
                            <label className="block text-sm text-gray-300 mb-3">
                                Answer <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-gray-600 focus:outline-none h-40 resize-none"
                                placeholder="Provide a detailed answer with explanations..."
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                Include reasoning, time/space complexity, and any important details.
                            </div>
                        </div>
                    )}

                    {activeTab === 'code' && (
                        <div>
                            <label className="block text-sm text-gray-300 mb-3">
                                Code Template <span className="text-gray-500">(Optional)</span>
                            </label>
                            <textarea
                                value={formData.codeTemplate}
                                onChange={(e) => setFormData({ ...formData, codeTemplate: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 text-gray-300 focus:border-gray-600 focus:outline-none h-64 resize-none font-mono text-sm"
                                placeholder={getDefaultCodeTemplate()}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                Provide a starting code template or implementation example. Leave empty for default template.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Actions */}
            <div className="p-6 flex items-center justify-between bg-gray-800/30">
                <div className="text-sm text-gray-400">
                    <span className="text-red-400">*</span> Required fields
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleCancel}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm rounded-lg min-h-[48px]"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.question.trim() || !formData.answer.trim() || !formData.category.trim()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium rounded-lg min-h-[48px]"
                    >
                        <Save className="w-4 h-4" />
                        <span>Create Flashcard</span>
                        <span className="hidden sm:inline ml-2 text-xs opacity-75">(Ctrl+Enter)</span>
                    </button>
                </div>
            </div>
        </div>
    );
};