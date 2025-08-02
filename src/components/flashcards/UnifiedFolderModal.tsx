import React, { useState } from 'react';
import { 
  Plus, Save, X, Sparkles, Zap, Code2, FolderPlus, Loader2, 
  CheckCircle, AlertCircle, BookOpen, User, Brain, MessageSquare 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Types
interface GeneratedFolder {
  id: string;
  name: string;
  description: string;
  flashcardCount: number;
}

interface UnifiedFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, description: string) => Promise<void>;
  onFolderGenerated: (folder: GeneratedFolder) => void;
  loading?: boolean;
}

type CreationMode = 'manual' | 'ai';
type AiStep = 'input' | 'success';

export function UnifiedFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
  onFolderGenerated,
  loading = false
}: UnifiedFolderModalProps) {
  // Mode switching
  const [creationMode, setCreationMode] = useState<CreationMode>('manual');
  
  // Manual creation state
  const [manualFormData, setManualFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI generation state
  const [aiFormData, setAiFormData] = useState({
    topic: '',
    cardCount: 10,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    includeCode: true,
    customPrompt: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
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

  // Reset functions
  const resetManualForm = () => {
    setManualFormData({
      name: '',
      description: ''
    });
  };

  const resetAiForm = () => {
    setAiFormData({
      topic: '',
      cardCount: 10,
      difficulty: 'Medium',
      includeCode: true,
      customPrompt: ''
    });
    setAiStep('input');
    setError('');
  };

  const resetAll = () => {
    resetManualForm();
    resetAiForm();
    setIsGenerating(false);
    setIsSubmitting(false);
    setCreationMode('manual');
  };

  // Manual creation handlers
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualFormData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateFolder(manualFormData.name.trim(), manualFormData.description.trim());
      resetAll();
      onClose();
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsSubmitting(false);
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
      const response = await fetch('/api/flashcard/folders/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate folder');
      }

      const data = await response.json();
      onFolderGenerated(data.folder);
      setAiStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate folder');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiSuccess = () => {
    resetAll();
    onClose();
  };

  // Close handler
  const handleClose = () => {
    if (!isGenerating && !isSubmitting) {
      resetAll();
      onClose();
    }
  };

  // Mode switching handler
  const handleModeSwitch = (mode: CreationMode) => {
    if (!isGenerating && !isSubmitting) {
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
                <h3 className="text-xl font-semibold text-white">Create Study Folder</h3>
                <p className="text-sm text-gray-400">
                  {creationMode === 'manual' ? 'Manually create a custom folder' : 'Generate a complete study folder with AI'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isGenerating || isSubmitting}
              className="text-gray-400 hover:text-white p-1 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-800/50 border border-gray-700 p-1 rounded-lg">
            <button
              onClick={() => handleModeSwitch('manual')}
              disabled={isGenerating || isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-md ${
                creationMode === 'manual'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              } ${(isGenerating || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <User className="w-4 h-4" />
              <span>Manual</span>
            </button>
            <button
              onClick={() => handleModeSwitch('ai')}
              disabled={isGenerating || isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-md ${
                creationMode === 'ai'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              } ${(isGenerating || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="folder-name" className="text-sm font-medium text-gray-300">
                    Folder Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="folder-name"
                    type="text"
                    value={manualFormData.name}
                    onChange={(e) => setManualFormData({ ...manualFormData, name: e.target.value })}
                    placeholder="e.g., JavaScript Fundamentals"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folder-description" className="text-sm font-medium text-gray-300">
                    Description
                  </Label>
                  <textarea
                    id="folder-description"
                    value={manualFormData.description}
                    onChange={(e) => setManualFormData({ ...manualFormData, description: e.target.value })}
                    placeholder="e.g., Basic JavaScript concepts, syntax, and best practices"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none h-20 resize-none"
                    disabled={isSubmitting}
                  />
                </div>
              </form>
            </div>
          ) : (
            // AI Generation Content
            <div>
              {aiStep === 'success' ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-900/50 border border-emerald-800 flex items-center justify-center mx-auto mb-4 rounded">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Folder Generated!</h3>
                  <p className="text-gray-400 mb-6">
                    Successfully created a study folder about "{aiFormData.topic}" with {aiFormData.cardCount} flashcards
                  </p>
                  <button
                    onClick={handleAiSuccess}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-md"
                  >
                    Done
                  </button>
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
                        Study Topic <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={aiFormData.topic}
                        onChange={(e) => setAiFormData({ ...aiFormData, topic: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-gray-600 focus:outline-none rounded-md"
                        placeholder="e.g., Data Structures, React Fundamentals, System Design..."
                        disabled={isGenerating}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Choose a comprehensive topic that can be broken down into multiple concepts
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
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-gray-600 focus:outline-none h-24 resize-none rounded-md"
                        placeholder="e.g., Focus on practical examples, include common interview questions, emphasize real-world applications..."
                        disabled={isGenerating}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Provide specific instructions to customize the content generation
                      </p>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Count */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Number of Flashcards</label>
                        <select
                          value={aiFormData.cardCount}
                          onChange={(e) => setAiFormData({ ...aiFormData, cardCount: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-gray-600 focus:outline-none rounded-md"
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
                          <p className="text-xs text-gray-400">Add relevant code templates and programming examples</p>
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

                    {/* Preview Info */}
                    <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-md">
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-300 mb-1">What you'll get:</h4>
                          <ul className="text-xs text-blue-200 space-y-1">
                            <li>• A comprehensive study folder with organized flashcards</li>
                            <li>• {aiFormData.cardCount} diverse questions covering different aspects of {aiFormData.topic || 'your topic'}</li>
                            <li>• {aiFormData.difficulty} difficulty level appropriate for your learning stage</li>
                            <li>• {aiFormData.includeCode ? 'Code examples and templates' : 'Conceptual questions without code'}</li>
                            <li>• Spaced repetition scheduling for optimal learning</li>
                            {aiFormData.customPrompt && <li>• Content customized based on your specific requirements</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {aiStep !== 'success' && (
          <div className="p-6 border-t border-gray-800 flex items-center justify-between bg-gray-800/30">
            {creationMode === 'manual' && (
              <>
                <div className="text-sm text-gray-400">
                  <span className="text-red-400">*</span> Required fields
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleManualSubmit}
                    disabled={!manualFormData.name.trim() || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Folder
                      </>
                    )}
                  </Button>
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
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
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
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}