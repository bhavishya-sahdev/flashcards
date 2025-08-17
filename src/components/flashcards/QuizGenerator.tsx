'use client';

import React, { useState } from 'react';
import { 
  Brain, Loader2, Download, Play, 
  ChevronRight, AlertCircle, CheckCircle, FileQuestion 
} from 'lucide-react';

// Types for mixed quiz generation
interface MixedQuizQuestion {
  id: string;
  type: 'mcq' | 'fill_blank';
  question?: string;
  text?: string;
  options?: string[];
  correctAnswer?: number;
  blanks?: {
    answer: string;
    position: number;
    hint?: string;
    alternatives?: string[];
  }[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  explanation?: string;
}

interface MixedQuiz {
  id: string;
  title: string;
  description: string;
  folderId: string;
  folderName: string;
  questionCount: number;
  questions: MixedQuizQuestion[];
  createdAt: string;
}

interface QuizGeneratorProps {
  folderId: string;
  folderName: string;
  onClose: () => void;
  onStartQuiz: (quiz: MixedQuiz) => void;
  mounted?: boolean;
}

type GenerationStep = 'configure' | 'generating' | 'preview' | 'success';

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  folderId,
  folderName,
  onClose,
  onStartQuiz,
  mounted = true,
}) => {
  const [currentStep, setCurrentStep] = useState<GenerationStep>('configure');
  const [error, setError] = useState<string>('');
  const [generatedQuiz, setGeneratedQuiz] = useState<MixedQuiz | null>(null);

  // Configuration states
  const [questionCount, setQuestionCount] = useState(8);

  const handleGenerate = async () => {
    setCurrentStep('generating');
    setError('');

    try {
      const response = await fetch(`/api/flashcard/folders/${folderId}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionCount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const result = await response.json();
      setGeneratedQuiz(result.quiz);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Quiz generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate quiz');
      setCurrentStep('configure');
    }
  };

  const handleStartQuiz = () => {
    if (generatedQuiz) {
      onStartQuiz(generatedQuiz);
    }
  };

  const handleDownload = () => {
    if (!generatedQuiz) return;

    const content = generateQuizText(generatedQuiz);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName}-mixed-quiz.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setCurrentStep('success');
  };

  const generateQuizText = (quiz: MixedQuiz): string => {
    let content = `${quiz.title}\n`;
    content += `${quiz.description}\n`;
    content += `Questions: ${quiz.questionCount}\n`;
    content += `Created: ${new Date(quiz.createdAt).toLocaleDateString()}\n\n`;
    content += '='.repeat(50) + '\n\n';

    quiz.questions.forEach((q, index) => {
      content += `${index + 1}. `;
      
      if (q.type === 'mcq') {
        content += `${q.question}\n\n`;
        q.options?.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          content += `${letter}) ${option}\n`;
        });
        content += `\nCorrect Answer: ${String.fromCharCode(65 + (q.correctAnswer || 0))}\n`;
      } else {
        content += `Fill in the blanks:\n${q.text}\n\n`;
        content += 'Answers:\n';
        q.blanks?.forEach((blank, blankIndex) => {
          content += `Blank ${blankIndex + 1}: ${blank.answer}\n`;
          if (blank.hint) {
            content += `Hint: ${blank.hint}\n`;
          }
          if (blank.alternatives && blank.alternatives.length > 0) {
            content += `Alternatives: ${blank.alternatives.join(', ')}\n`;
          }
        });
      }
      
      if (q.explanation) {
        content += `\nExplanation: ${q.explanation}\n`;
      }
      content += `\nDifficulty: ${q.difficulty} | Type: ${q.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blanks'}\n`;
      content += '\n' + '-'.repeat(30) + '\n\n';
    });

    return content;
  };

  const staggerDelay = (index: number) => ({
    transform: mounted ? 'translateY(0)' : 'translateY(10px)',
    opacity: mounted ? 1 : 0,
    transition: 'all 0.2s ease-out',
    transitionDelay: `${index * 100}ms`
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8" style={staggerDelay(0)}>
        <h2 className="text-2xl font-bold text-white mb-2">Generate Interactive Quiz</h2>
        <p className="text-gray-400">
          Create a mixed quiz with multiple choice and fill-in-the-blank questions from your {folderName} flashcards
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8" style={staggerDelay(1)}>
        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center gap-2 ${
            ['configure', 'generating', 'preview'].includes(currentStep)
              ? 'text-emerald-400' : 'text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              ['configure', 'generating', 'preview'].includes(currentStep)
                ? 'bg-emerald-400' : 'bg-gray-600'
            }`} />
            Configure
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <div className={`flex items-center gap-2 ${
            ['preview'].includes(currentStep)
              ? 'text-emerald-400' : 'text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              ['preview'].includes(currentStep)
                ? 'bg-emerald-400' : 'bg-gray-600'
            }`} />
            Preview
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <div className={`flex items-center gap-2 ${
            ['success'].includes(currentStep)
              ? 'text-emerald-400' : 'text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              ['success'].includes(currentStep)
                ? 'bg-emerald-400' : 'bg-gray-600'
            }`} />
            Complete
          </div>
        </div>
      </div>

      {/* Step 1: Configuration */}
      {currentStep === 'configure' && (
        <div className="space-y-6" style={staggerDelay(2)}>
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">
              Configure Mixed Quiz
            </h3>
          </div>

          <div className="p-6 bg-gray-800/30 border border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-900/50 border border-emerald-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FileQuestion className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-white">Mixed Types</p>
                <p className="text-xs text-gray-400">MCQ + Fill-in-blanks</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-900/50 border border-orange-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-sm font-medium text-white">Smart Difficulty</p>
                <p className="text-xs text-gray-400">Auto-mixed levels</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-900/50 border border-emerald-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Play className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-white">Interactive</p>
                <p className="text-xs text-gray-400">Take quiz online</p>
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Number of Questions</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded focus:border-emerald-500 focus:outline-none"
              >
                {[5, 6, 7, 8, 9, 10, 12, 15].map(num => (
                  <option key={num} value={num}>{num} questions</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Questions will be automatically mixed between multiple choice and fill-in-the-blank types
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-800 text-red-400 text-sm flex items-center gap-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Action Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium transition-colors rounded"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generating */}
      {currentStep === 'generating' && (
        <div className="text-center py-12" style={staggerDelay(2)}>
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white mb-2">Generating Your Quiz</h3>
          <p className="text-gray-400">
            Creating {questionCount} mixed questions with smart difficulty distribution...
          </p>
        </div>
      )}

      {/* Step 3: Preview */}
      {currentStep === 'preview' && generatedQuiz && (
        <div className="space-y-6" style={staggerDelay(2)}>
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">{generatedQuiz.title}</h3>
            <p className="text-gray-400">{generatedQuiz.description}</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-400">
              <span>{generatedQuiz.questionCount} questions</span>
              <span>•</span>
              <span>Mixed difficulty</span>
              <span>•</span>
              <span>
                {generatedQuiz.questions.filter(q => q.type === 'mcq').length} MCQ, {' '}
                {generatedQuiz.questions.filter(q => q.type === 'fill_blank').length} Fill-in-blank
              </span>
            </div>
          </div>

          {/* Preview questions */}
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {generatedQuiz.questions.slice(0, 3).map((question, index) => (
              <div key={index} className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    question.type === 'mcq' 
                      ? 'bg-emerald-900/50 text-emerald-400' 
                      : 'bg-orange-900/50 text-orange-400'
                  }`}>
                    {question.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blanks'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    question.difficulty === 'Easy' ? 'bg-green-900/50 text-green-400' :
                    question.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
                
                {question.type === 'mcq' ? (
                  <div>
                    <p className="text-white font-medium mb-3">{index + 1}. {question.question}</p>
                    <div className="space-y-1">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className={`text-sm p-2 rounded ${
                          optIndex === question.correctAnswer
                            ? 'text-green-400 bg-green-900/20'
                            : 'text-gray-400'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}) {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium mb-3">{index + 1}. Fill in the blanks:</p>
                    <p className="text-gray-300 mb-2">{question.text}</p>
                    <div className="text-sm text-gray-400">
                      {question.blanks?.map((blank, blankIndex) => (
                        <div key={blankIndex} className="mb-1">
                          Blank {blankIndex + 1}: <span className="text-green-400">{blank.answer}</span>
                          {blank.hint && <span className="text-gray-500"> (Hint: {blank.hint})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {generatedQuiz.questionCount > 3 && (
              <div className="text-center text-gray-400 text-sm">
                ... and {generatedQuiz.questionCount - 3} more questions
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep('configure')}
              className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors rounded"
            >
              Back
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white transition-colors rounded"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleStartQuiz}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-colors rounded"
            >
              <Play className="w-4 h-4" />
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {currentStep === 'success' && (
        <div className="text-center py-12" style={staggerDelay(2)}>
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Quiz Downloaded!</h3>
          <p className="text-gray-400 mb-6">
            Your quiz has been saved as a text file. You can also generate a new quiz or take it interactively.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setCurrentStep('configure')}
              className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors rounded"
            >
              Create Another
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white transition-colors rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};