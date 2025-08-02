import React, { useState } from 'react';
import { Sparkles, Zap, Code2, FolderPlus, Loader2, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';

interface GeneratedFolder {
  id: string;
  name: string;
  description: string;
  flashcardCount: number;
}

interface FolderGeneratorProps {
  onFolderGenerated: (folder: GeneratedFolder) => void;
  onCancel?: () => void;
  mounted?: boolean;
}

export const FolderGenerator: React.FC<FolderGeneratorProps> = ({
  onFolderGenerated,
  onCancel,
  mounted = true,
}) => {
  const [formData, setFormData] = useState({
    topic: '',
    cardCount: 10,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    includeCode: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'success'>('input');

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/flashcard/folders/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate folder');
      }

      const data = await response.json();
      onFolderGenerated(data.folder);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate folder');
    } finally {
      setIsGenerating(false);
    }
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
      <div className="bg-gray-900 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Folder Generated!</h3>
        <p className="text-gray-400 mb-6">
          Successfully created a study folder about "{formData.topic}" with {formData.cardCount} flashcards
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

  return (
    <div className="bg-gray-900">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <FolderPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Folder Generator</h3>
            <p className="text-sm text-gray-400">Create a complete study folder with flashcards using AI</p>
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
              Study Topic <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-gray-600 focus:outline-none"
              placeholder="e.g., Data Structures, React Fundamentals, System Design..."
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose a comprehensive topic that can be broken down into multiple concepts
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Count */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Number of Flashcards</label>
              <select
                value={formData.cardCount}
                onChange={(e) => setFormData({ ...formData, cardCount: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-gray-600 focus:outline-none"
                disabled={isGenerating}
              >
                {[5, 8, 10, 12, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} flashcards
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                More cards = more comprehensive coverage
              </p>
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
                    className={`flex-1 px-3 py-3 border text-sm font-medium transition-all duration-200 ${
                      formData.difficulty === level
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
                <p className="text-xs text-gray-400">Add relevant code templates and programming examples</p>
              </div>
            </div>
            <button
              onClick={() => setFormData({ ...formData, includeCode: !formData.includeCode })}
              disabled={isGenerating}
              className={`w-12 h-6 rounded-full border-2 transition-colors ${
                formData.includeCode
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-gray-700 border-gray-600'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.includeCode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Preview Info */}
          <div className="bg-blue-900/20 border border-blue-800 p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-1">What you'll get:</h4>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• A comprehensive study folder with organized flashcards</li>
                  <li>• {formData.cardCount} diverse questions covering different aspects of {formData.topic || 'your topic'}</li>
                  <li>• {formData.difficulty} difficulty level appropriate for your learning stage</li>
                  <li>• {formData.includeCode ? 'Code examples and templates' : 'Conceptual questions without code'}</li>
                  <li>• Spaced repetition scheduling for optimal learning</li>
                </ul>
              </div>
            </div>
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
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Folder...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate Study Folder
            </>
          )}
        </button>
      </div>
    </div>
  );
};