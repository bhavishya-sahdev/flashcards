'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, Trophy, Target, CheckCircle, XCircle, 
  Calendar, User, Brain, RotateCcw, Download, Eye, EyeOff 
} from 'lucide-react';

interface QuizAnswer {
  questionId: string;
  type: 'mcq' | 'fill_blank';
  selectedOption?: number;
  blankAnswers?: string[];
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizQuestion {
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

interface QuizResultData {
  id: number;
  quizId: string;
  title: string;
  description?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  startedAt: string;
  completedAt: string;
  createdAt: string;
}

interface QuizResultDetailsProps {
  quizResultId: number;
  onBack: () => void;
  onRetakeQuiz: () => void;
  mounted?: boolean;
}

export const QuizResultDetails: React.FC<QuizResultDetailsProps> = ({
  quizResultId,
  onBack,
  onRetakeQuiz,
  mounted = true,
}) => {
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetchQuizDetails();
  }, [quizResultId]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quiz/details/${quizResultId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz details');
      }
      const data = await response.json();
      setQuizResult(data.quizResult);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      setError('Failed to load quiz details');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-900/50 text-emerald-400 border-emerald-800';
      case 'Medium': return 'bg-amber-900/50 text-amber-400 border-amber-800';
      case 'Hard': return 'bg-red-900/50 text-red-400 border-red-800';
      default: return 'bg-gray-900/50 text-gray-400 border-gray-800';
    }
  };

  const exportResults = () => {
    if (!quizResult) return;

    let content = `Quiz Results: ${quizResult.title}\n`;
    content += `Completed: ${new Date(quizResult.completedAt).toLocaleString()}\n`;
    content += `Score: ${quizResult.score}% (${quizResult.correctAnswers}/${quizResult.totalQuestions})\n`;
    content += `Time: ${formatTime(quizResult.timeSpent)}\n\n`;
    content += '='.repeat(50) + '\n\n';

    quizResult.questions.forEach((question, index) => {
      const answer = quizResult.answers.find(a => a.questionId === question.id);
      content += `${index + 1}. `;

      if (question.type === 'mcq') {
        content += `${question.question}\n\n`;
        question.options?.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          const isCorrect = optIndex === question.correctAnswer;
          const isSelected = answer?.selectedOption === optIndex;
          let prefix = `${letter}) `;
          if (isCorrect) prefix += '✓ ';
          if (isSelected && !isCorrect) prefix += '✗ ';
          content += `${prefix}${option}\n`;
        });
        content += `\nYour answer: ${answer?.selectedOption !== undefined ? String.fromCharCode(65 + answer.selectedOption) : 'Not answered'}\n`;
        content += `Correct answer: ${String.fromCharCode(65 + (question.correctAnswer || 0))}\n`;
        content += `Result: ${answer?.isCorrect ? '✓ Correct' : '✗ Incorrect'}\n`;
      } else {
        content += `Fill in the blanks: ${question.text}\n\n`;
        content += 'Your answers:\n';
        answer?.blankAnswers?.forEach((userAnswer, blankIndex) => {
          const correctAnswer = question.blanks?.[blankIndex]?.answer || '';
          content += `Blank ${blankIndex + 1}: "${userAnswer}" (Correct: "${correctAnswer}")\n`;
        });
        content += `Result: ${answer?.isCorrect ? '✓ Correct' : '✗ Incorrect'}\n`;
      }

      if (question.explanation) {
        content += `\nExplanation: ${question.explanation}\n`;
      }
      content += `Difficulty: ${question.difficulty}\n`;
      content += '\n' + '-'.repeat(30) + '\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${quizResult.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const staggerDelay = (index: number) => ({
    transform: mounted ? 'translateY(0)' : 'translateY(10px)',
    opacity: mounted ? 1 : 0,
    transition: 'all 0.3s ease-out',
    transitionDelay: `${index * 100}ms`
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading quiz details...</p>
      </div>
    );
  }

  if (error || !quizResult) {
    return (
      <div className="p-8 text-center">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white transition-colors rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      {/* Header */}
      <div className="mb-8" style={staggerDelay(0)}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quiz History
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{quizResult.title}</h1>
            {quizResult.description && (
              <p className="text-gray-400 mb-4">{quizResult.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(quizResult.completedAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(quizResult.timeSpent)}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(quizResult.score)}`}>
              {quizResult.score}%
            </div>
            <div className="text-sm text-gray-400">
              {quizResult.correctAnswers}/{quizResult.totalQuestions} correct
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={staggerDelay(1)}>
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{quizResult.score}%</div>
          <div className="text-sm text-gray-400">Final Score</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
          <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{quizResult.correctAnswers}</div>
          <div className="text-sm text-gray-400">Correct Answers</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
          <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{formatTime(quizResult.timeSpent)}</div>
          <div className="text-sm text-gray-400">Time Taken</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6" style={staggerDelay(2)}>
        <h2 className="text-xl font-semibold">Question Review</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white transition-colors rounded"
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? 'Hide' : 'Show'} Answers
          </button>
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white transition-colors rounded"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-6 mb-8">
        {quizResult.questions.map((question, index) => {
          const answer = quizResult.answers.find(a => a.questionId === question.id);
          return (
            <div
              key={question.id}
              className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg"
              style={staggerDelay(index + 3)}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-gray-400">Question {index + 1}</span>
                <span className={`px-2 py-1 text-xs font-medium border rounded ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
                <span className={`px-2 py-1 text-xs font-medium border rounded ${
                  question.type === 'mcq' 
                    ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800' 
                    : 'bg-orange-900/50 text-orange-400 border-orange-800'
                }`}>
                  {question.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blanks'}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  {answer?.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${answer?.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {answer?.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              </div>

              {question.type === 'mcq' ? (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">{question.question}</h3>
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => {
                      const isCorrect = optIndex === question.correctAnswer;
                      const isSelected = answer?.selectedOption === optIndex;
                      let bgColor = 'bg-gray-700/50';
                      let textColor = 'text-gray-300';
                      let borderColor = 'border-gray-600';

                      if (showAnswers) {
                        if (isCorrect) {
                          bgColor = 'bg-emerald-900/30';
                          textColor = 'text-emerald-300';
                          borderColor = 'border-emerald-700';
                        } else if (isSelected && !isCorrect) {
                          bgColor = 'bg-red-900/30';
                          textColor = 'text-red-300';
                          borderColor = 'border-red-700';
                        }
                      } else if (isSelected) {
                        bgColor = 'bg-gray-600/50';
                        textColor = 'text-white';
                        borderColor = 'border-gray-500';
                      }

                      return (
                        <div
                          key={optIndex}
                          className={`p-3 border rounded ${bgColor} ${borderColor}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {String.fromCharCode(65 + optIndex)})
                            </span>
                            <span className={textColor}>{option}</span>
                            {showAnswers && isCorrect && (
                              <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                            )}
                            {showAnswers && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-red-400 ml-auto" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Fill in the blanks:</h3>
                  <div className="mb-4">
                    {question.text?.split('______').map((part, partIndex, array) => (
                      <span key={partIndex}>
                        {part}
                        {partIndex < array.length - 1 && (
                          <span className={`inline-block mx-2 px-3 py-1 border rounded ${
                            showAnswers 
                              ? (answer?.isCorrect 
                                  ? 'bg-emerald-900/30 border-emerald-700 text-emerald-300'
                                  : 'bg-red-900/30 border-red-700 text-red-300')
                              : 'bg-gray-700/50 border-gray-600 text-gray-300'
                          }`}>
                            {answer?.blankAnswers?.[partIndex] || '_____'}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                  {showAnswers && (
                    <div className="space-y-2">
                      {question.blanks?.map((blank, blankIndex) => (
                        <div key={blankIndex} className="text-sm">
                          <span className="text-gray-400">Blank {blankIndex + 1}:</span>
                          <span className="text-emerald-400 ml-2">Correct: "{blank.answer}"</span>
                          <span className="text-gray-400 ml-2">Your answer: "{answer?.blankAnswers?.[blankIndex] || 'Not answered'}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showAnswers && question.explanation && (
                <div className="mt-4 p-3 bg-gray-700/30 border border-gray-600 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-400">Explanation</span>
                  </div>
                  <p className="text-gray-300 text-sm">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center" style={staggerDelay(quizResult.questions.length + 4)}>
        <button
          onClick={onRetakeQuiz}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium transition-colors rounded"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Quiz
        </button>
      </div>
    </div>
  );
};