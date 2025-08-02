import React, { useState } from 'react';
import { Sparkles, Zap, Code2, BookOpen, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface GeneratedFlashcard {
  question: string;
  answer: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  codeTemplate?: string;
}

interface FlashcardGeneratorProps {
  folderId: string;
  onCardsGenerated: (cards: GeneratedFlashcard[]) => void;
  onCancel?: () => void;
  mounted?: boolean;
}

export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({
  folderId,
  onCardsGenerated,
  onCancel,
  mounted = true,
}) => {
  const [formData, setFormData] = useState({
    topic: '',
    count: 3,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    includeCode: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([]);
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/flashcard/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          folderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      setGeneratedCards(data.flashcards);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptCards = () => {
    onCardsGenerated(generatedCards);
    setStep('success');
  };

  const handleRegenerate = () => {
    setStep('input');
    setGeneratedCards([]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'border-emerald-600 bg-emerald-900/20 text-emerald-400';
      case 'Medium': return 'border-amber-600 bg-amber-900/20 text-amber-400';
      case 'Hard': return 'border-red-600 bg-red-900/20 text-red-400';
      default: return 'border-gray-600 bg-gray-900/20 text-gray-400';
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-gray-900 border border-gray-800 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Flashcards Generated!</h3>
        <p className="text-gray-400 mb-6">
          Successfully generated {generatedCards.length} flashcard(s) about "{formData.topic}"
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="bg-gray-900">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Generated Flashcards</h3>
              <p className="text-sm text-gray-400">Review and accept the generated cards</p>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {generatedCards.map((card, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Card {index + 1}</span>
                  <div className={`px-2 py-1 border text-xs ${getDifficultyColor(card.difficulty)}`}>
                    {card.difficulty}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-1">Question:</h4>
                    <p className="text-white text-sm">{card.question}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-1">Answer:</h4>
                    <p className="text-gray-300 text-sm">{card.answer}</p>
                  </div>
                  {card.codeTemplate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Code:</h4>
                      <pre className="text-xs text-gray-400 bg-gray-900/50 p-2 overflow-x-auto">
                        {card.codeTemplate.slice(0, 100)}...
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 flex gap-3">
          <button
            onClick={handleRegenerate}
            className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={handleAcceptCards}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            Accept & Add Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Flashcard Generator</h3>
            <p className="text-sm text-gray-400">Generate flashcards automatically using AI</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 p-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Topic <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-gray-600 focus:outline-none"
              placeholder="e.g., Binary Trees, React Hooks, Python Lists..."
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific for better results (e.g., "Binary Search Trees" vs "Trees")
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Count */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Number of Cards</label>
              <select
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-gray-600 focus:outline-none"
                disabled={isGenerating}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} card{num !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Difficulty Level</label>
              <div className="flex gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    disabled={isGenerating}
                    className={`flex-1 px-3 py-3 border text-sm font-medium transition-all duration-200 ${formData.difficulty === level
                      ? getDifficultyColor(level)
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                      } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Include Code Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-white">Include Code Examples</h4>
                <p className="text-xs text-gray-400">Add relevant code templates and examples</p>
              </div>
            </div>
            <button
              onClick={() => setFormData({ ...formData, includeCode: !formData.includeCode })}
              disabled={isGenerating}
              className={`w-12 h-6 rounded-full border-2 transition-colors ${formData.includeCode
                ? 'bg-blue-600 border-blue-600'
                : 'bg-gray-700 border-gray-600'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.includeCode ? 'translate-x-6' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 flex gap-3">
        <button
          onClick={onCancel}
          disabled={isGenerating}
          className="px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.topic.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate Flashcards
            </>
          )}
        </button>
      </div>
    </div>
  );
};