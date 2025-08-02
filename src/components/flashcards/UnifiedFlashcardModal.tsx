import React, { useState } from 'react';
import { 
  Plus, Save, X, Sparkles, Zap, Code2, BookOpen, Loader2, 
  CheckCircle, AlertCircle, HelpCircle, Lightbulb, User, Brain, MessageSquare 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Flashcard } from '@/lib/types';

// Types
type FlashcardCreationData = Pick<Flashcard, 'question' | 'answer' | 'category' | 'difficulty' | 'codeTemplate'>;

interface GeneratedFlashcard {
  question: string;
  answer: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  codeTemplate?: string;
}

interface UnifiedFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onCreateFlashcard: (flashcard: FlashcardCreationData) => void;
  onCardsGenerated: (cards: GeneratedFlashcard[]) => void;
  mounted?: boolean;
}

type CreationMode = 'manual' | 'ai';
type ManualTab = 'question' | 'answer' | 'code';
type AiStep = 'input' | 'preview' | 'success';

export const UnifiedFlashcardModal: React.FC<UnifiedFlashcardModalProps> = ({
  isOpen,
  onClose,
  folderId,
  onCreateFlashcard,
  onCardsGenerated,
  mounted = true,
}) => {
  // Mode switching
  const [creationMode, setCreationMode] = useState<CreationMode>('manual');
  
  // Manual creation state
  const [manualFormData, setManualFormData] = useState({
    question: '',
    answer: '',
    category: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    codeTemplate: ''
  });
  const [activeTab, setActiveTab] = useState<ManualTab>('question');
  
  // AI generation state
  const [aiFormData, setAiFormData] = useState({
    topic: '',
    count: 3,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    includeCode: true,
    customPrompt: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([]);
  const [aiStep, setAiStep] = useState<AiStep>('input');

  // Utility functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'border-emerald-600 bg-emerald-900/20 text-emerald-400';
      case 'Medium': return 'border-amber-600 bg-amber-900/20 text-amber-400';
      case 'Hard': return 'border-red-600 bg-red-900/20 text-red-400';
      default: return 'border-gray-600 bg-gray-900/20 text-gray-400';
    }
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

  // Reset functions
  const resetManualForm = () => {
    setManualFormData({
      question: '',
      answer: '',
      category: '',
      difficulty: 'Medium',
      codeTemplate: ''
    });
    setActiveTab('question');
  };

  const resetAiForm = () => {
    setAiFormData({
      topic: '',
      count: 3,
      difficulty: 'Medium',
      includeCode: true,
      customPrompt: ''
    });
    setGeneratedCards([]);
    setAiStep('input');
    setError('');
  };

  const resetAll = () => {
    resetManualForm();
    resetAiForm();
    setIsGenerating(false);
    setCreationMode('manual');
  };

  // Manual creation handlers
  const handleManualSubmit = () => {
    if (manualFormData.question.trim() && manualFormData.answer.trim() && manualFormData.category.trim()) {
      onCreateFlashcard({
        question: manualFormData.question.trim(),
        answer: manualFormData.answer.trim(),
        category: manualFormData.category.trim(),
        difficulty: manualFormData.difficulty,
        codeTemplate: manualFormData.codeTemplate.trim() || getDefaultCodeTemplate()
      });
      resetAll();
      onClose();
    }
  };

  // AI generation handlers
  const handleGenerate = async () => {
    if (!aiFormData.topic.trim()) {
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
          ...aiFormData,
          folderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      setGeneratedCards(data.flashcards);
      setAiStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptCards = () => {
    onCardsGenerated(generatedCards);
    setAiStep('success');
  };

  const handleRegenerate = () => {
    setAiStep('input');
    setGeneratedCards([]);
  };

  const handleAiSuccess = () => {
    resetAll();
    onClose();
  };

  // Close handler
  const handleClose = () => {
    if (!isGenerating) {
      resetAll();
      onClose();
    }
  };

  // Mode switching handler
  const handleModeSwitch = (mode: CreationMode) => {
    if (!isGenerating) {
      setCreationMode(mode);
      setError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-hidden border-0 p-0">
        {/* Header with Mode Switcher */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded">
                {creationMode === 'manual' ? <Plus className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Create Flashcards</h3>
                <p className="text-sm text-gray-400">
                  {creationMode === 'manual' ? 'Manually create a custom flashcard' : 'Generate flashcards automatically with AI'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isGenerating}
              className="text-gray-400 hover:text-white p-1 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-800/50 border border-gray-700 p-1 rounded-lg">
            <button
              onClick={() => handleModeSwitch('manual')}
              disabled={isGenerating}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-md ${
                creationMode === 'manual'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <User className="w-4 h-4" />
              <span>Manual</span>
            </button>
            <button
              onClick={() => handleModeSwitch('ai')}
              disabled={isGenerating}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-md ${
                creationMode === 'ai'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Generate</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {creationMode === 'manual' ? (
            // Manual Creation Content
            <div className="p-6">
              {/* Form Header - Category and Difficulty */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={manualFormData.category}
                    onChange={(e) => setManualFormData({ ...manualFormData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-gray-600 focus:outline-none rounded-md"
                    placeholder="e.g., Arrays, Trees, Dynamic Programming..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
                  <div className="flex gap-2">
                    {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setManualFormData({ ...manualFormData, difficulty: level })}
                        className={`px-4 py-3 border text-sm font-medium transition-all duration-200 rounded-md ${
                          manualFormData.difficulty === level
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
                    onClick={() => setActiveTab(id as ManualTab)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                      activeTab === id
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
                      value={manualFormData.question}
                      onChange={(e) => setManualFormData({ ...manualFormData, question: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-gray-600 focus:outline-none h-32 resize-none rounded-md"
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
                      value={manualFormData.answer}
                      onChange={(e) => setManualFormData({ ...manualFormData, answer: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-gray-600 focus:outline-none h-40 resize-none rounded-md"
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
                      value={manualFormData.codeTemplate}
                      onChange={(e) => setManualFormData({ ...manualFormData, codeTemplate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-700 text-gray-300 focus:border-gray-600 focus:outline-none h-64 resize-none font-mono text-sm rounded-md"
                      placeholder={getDefaultCodeTemplate()}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Provide a starting code template or implementation example. Leave empty for default template.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // AI Generation Content
            <div>
              {aiStep === 'success' ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-4 rounded">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Flashcards Generated!</h3>
                  <p className="text-gray-400 mb-6">
                    Successfully generated {generatedCards.length} flashcard(s) about "{aiFormData.topic}"
                  </p>
                  <button
                    onClick={handleAiSuccess}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-md"
                  >
                    Done
                  </button>
                </div>
              ) : aiStep === 'preview' ? (
                <div>
                  <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center rounded">
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
                        <div key={index} className="bg-gray-800/50 border border-gray-700 p-4 rounded-md">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-400">Card {index + 1}</span>
                            <div className={`px-2 py-1 border text-xs rounded ${getDifficultyColor(card.difficulty)}`}>
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
                                <pre className="text-xs text-gray-400 bg-gray-900/50 p-2 overflow-x-auto rounded">
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
                      className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors rounded-md"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={handleAcceptCards}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white transition-colors rounded-md"
                    >
                      Accept & Add Cards
                    </button>
                  </div>
                </div>
              ) : (
                // AI Input Form
                <div className="p-6">
                  {error && (
                    <div className="bg-red-900/20 border border-red-800 p-3 mb-6 flex items-center gap-2 rounded-md">
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
                        value={aiFormData.topic}
                        onChange={(e) => setAiFormData({ ...aiFormData, topic: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-gray-600 focus:outline-none rounded-md"
                        placeholder="e.g., Binary Trees, React Hooks, Python Lists..."
                        disabled={isGenerating}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Be specific for better results (e.g., "Binary Search Trees" vs "Trees")
                      </p>
                    </div>

                    {/* Custom Generation Prompt */}
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        Custom Generation Prompt <span className="text-gray-500">(Optional)</span>
                      </label>
                      <textarea
                        value={aiFormData.customPrompt}
                        onChange={(e) => setAiFormData({ ...aiFormData, customPrompt: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-gray-600 focus:outline-none h-20 resize-none rounded-md"
                        placeholder="e.g., Focus on practical examples, include edge cases, emphasize interview questions..."
                        disabled={isGenerating}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Provide specific instructions to customize the flashcard generation
                      </p>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Count */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Number of Cards</label>
                        <select
                          value={aiFormData.count}
                          onChange={(e) => setAiFormData({ ...aiFormData, count: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-gray-600 focus:outline-none rounded-md"
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
                              onClick={() => setAiFormData({ ...aiFormData, difficulty: level })}
                              disabled={isGenerating}
                              className={`flex-1 px-3 py-3 border text-sm font-medium transition-all duration-200 rounded-md ${
                                aiFormData.difficulty === level
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
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700 rounded-md">
                      <div className="flex items-center gap-3">
                        <Code2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-white">Include Code Examples</h4>
                          <p className="text-xs text-gray-400">Add relevant code templates and examples</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAiFormData({ ...aiFormData, includeCode: !aiFormData.includeCode })}
                        disabled={isGenerating}
                        className={`w-12 h-6 rounded-full border-2 transition-colors ${
                          aiFormData.includeCode
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-gray-700 border-gray-600'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            aiFormData.includeCode ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {aiStep !== 'preview' && aiStep !== 'success' && (
          <div className="p-6 border-t border-gray-800 flex items-center justify-between bg-gray-800/30">
            {creationMode === 'manual' && (
              <>
                <div className="text-sm text-gray-400">
                  <span className="text-red-400">*</span> Required fields
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm rounded-md"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualFormData.question.trim() || !manualFormData.answer.trim() || !manualFormData.category.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium rounded-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Create Flashcard</span>
                  </button>
                </div>
              </>
            )}

            {creationMode === 'ai' && (
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleClose}
                  disabled={isGenerating}
                  className="px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !aiFormData.topic.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
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
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};