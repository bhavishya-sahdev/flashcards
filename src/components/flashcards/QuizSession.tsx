'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle, X, Clock, 
  ArrowRight, RotateCcw, Trophy, Target, Brain, Flag 
} from 'lucide-react';

// Types for quiz questions
interface MCQQuestion {
  id: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  explanation?: string;
}

interface FillBlankQuestion {
  id: string;
  type: 'fill_blank';
  text: string;
  blanks: {
    answer: string;
    position: number;
    hint?: string;
    alternatives?: string[];
  }[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  explanation?: string;
}

type QuizQuestion = MCQQuestion | FillBlankQuestion;

interface Quiz {
  id: string;
  title: string;
  description: string;
  folderId: string;
  folderName: string;
  questionCount: number;
  questions: QuizQuestion[];
  createdAt: string;
}

interface QuizAnswer {
  questionId: string;
  type: 'mcq' | 'fill_blank';
  // MCQ answer
  selectedOption?: number;
  // Fill-in-the-blank answers
  blankAnswers?: string[];
  isCorrect?: boolean;
  timeSpent?: number;
}

interface QuizSessionProps {
  quiz: Quiz;
  onComplete: (results: QuizResults) => void;
  onExit: () => void;
  mounted?: boolean;
}

interface QuizResults {
  quiz: Quiz;
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
  quiz,
  onComplete,
  onExit,
  mounted = true,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, QuizAnswer>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const currentAnswer = answers.get(currentQuestion.id);

  // MCQ answer handling
  const handleMCQAnswer = (optionIndex: number) => {
    if (isSubmitted) return;

    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = optionIndex === (currentQuestion as MCQQuestion).correctAnswer;
    
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      type: 'mcq',
      selectedOption: optionIndex,
      isCorrect,
      timeSpent,
    };

    setAnswers(prev => new Map(prev).set(currentQuestion.id, answer));
  };

  // Fill-in-the-blank answer handling
  const handleFillBlankAnswer = (blankIndex: number, value: string) => {
    if (isSubmitted) return;

    const currentBlankAnswers = currentAnswer?.blankAnswers || Array((currentQuestion as FillBlankQuestion).blanks.length).fill('');
    currentBlankAnswers[blankIndex] = value;

    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      type: 'fill_blank',
      blankAnswers: currentBlankAnswers,
      timeSpent: Date.now() - questionStartTime,
    };

    setAnswers(prev => new Map(prev).set(currentQuestion.id, answer));
  };

  // Check if fill-in-the-blank answer is correct
  const checkFillBlankCorrect = (answer: QuizAnswer): boolean => {
    if (answer.type !== 'fill_blank' || !answer.blankAnswers) return false;
    
    const question = currentQuestion as FillBlankQuestion;
    return question.blanks.every((blank, index) => {
      const userAnswer = answer.blankAnswers![index]?.toLowerCase().trim();
      const correctAnswer = blank.answer.toLowerCase().trim();
      const alternatives = blank.alternatives?.map(alt => alt.toLowerCase().trim()) || [];
      
      return userAnswer === correctAnswer || alternatives.includes(userAnswer);
    });
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const submitQuiz = async () => {
    // Calculate results
    const answersArray = Array.from(answers.values());
    let correctCount = 0;

    answersArray.forEach(answer => {
      if (answer.type === 'mcq') {
        if (answer.isCorrect) correctCount++;
      } else if (answer.type === 'fill_blank') {
        const question = quiz.questions.find(q => q.id === answer.questionId) as FillBlankQuestion;
        if (question && checkFillBlankCorrect(answer)) {
          correctCount++;
          answer.isCorrect = true;
        } else {
          answer.isCorrect = false;
        }
      }
    });

    const totalTime = Date.now() - startTime;
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const completedAt = new Date().toISOString();

    const results: QuizResults = {
      quiz,
      answers: answersArray,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      timeSpent: totalTime,
      completedAt,
    };

    // Save results to database
    try {
      await fetch('/api/quiz/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          folderId: parseInt(quiz.folderId),
          title: quiz.title,
          description: quiz.description,
          score,
          totalQuestions: quiz.questions.length,
          correctAnswers: correctCount,
          timeSpent: totalTime,
          questions: quiz.questions,
          answers: answersArray,
          startedAt: new Date(startTime).toISOString(),
          completedAt,
        }),
      });
    } catch (error) {
      console.error('Failed to save quiz results:', error);
      // Continue with showing results even if save fails
    }

    setShowResults(true);
    setIsSubmitted(true);
    onComplete(results);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showResults) return;

      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        goToPreviousQuestion();
      } else if (e.key === 'ArrowRight' && currentQuestionIndex < quiz.questions.length - 1) {
        goToNextQuestion();
      } else if (e.key === 'Enter' && isLastQuestion && currentAnswer) {
        submitQuiz();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, isLastQuestion, currentAnswer, showResults]);

  // Progress calculation
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.size;

  const staggerDelay = (index: number) => ({
    transform: mounted ? 'translateY(0)' : 'translateY(10px)',
    opacity: mounted ? 1 : 0,
    transition: 'all 0.3s ease-out',
    transitionDelay: `${index * 100}ms`
  });

  if (showResults) {
    const score = Math.round((Array.from(answers.values()).filter(a => a.isCorrect).length / quiz.questions.length) * 100);
    const timeInMinutes = Math.round((Date.now() - startTime) / 60000);

    return (
      <div className="max-w-2xl mx-auto p-6 text-white">
        <div className="text-center mb-8" style={staggerDelay(0)}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-gray-400">{quiz.title}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={staggerDelay(1)}>
          <div className="bg-gray-800/50 border border-gray-700 p-6 text-center">
            <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{score}%</div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 p-6 text-center">
            <CheckCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {Array.from(answers.values()).filter(a => a.isCorrect).length}/{quiz.questions.length}
            </div>
            <div className="text-sm text-gray-400">Correct</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 p-6 text-center">
            <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{timeInMinutes}m</div>
            <div className="text-sm text-gray-400">Time</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center" style={staggerDelay(2)}>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            Back to Folder
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      {/* Header */}
      <div className="mb-8" style={staggerDelay(0)}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Exit Quiz
          </button>
          <div className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{answeredCount}/{quiz.questions.length} answered</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-8" style={staggerDelay(1)}>
        <div className="bg-gray-800/50 border border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              currentQuestion.difficulty === 'Easy' ? 'bg-green-900/50 text-green-400' :
              currentQuestion.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
              'bg-red-900/50 text-red-400'
            }`}>
              {currentQuestion.difficulty}
            </span>
            <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded">
              {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blanks'}
            </span>
          </div>

          {currentQuestion.type === 'mcq' ? (
            // MCQ Question
            <div>
              <h3 className="text-lg font-medium text-white mb-6">
                {(currentQuestion as MCQQuestion).question}
              </h3>
              <div className="space-y-3">
                {(currentQuestion as MCQQuestion).options.map((option, index) => {
                  const isSelected = currentAnswer?.selectedOption === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleMCQAnswer(index)}
                      className={`w-full p-4 text-left border transition-colors ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300 hover:bg-gray-800/50'
                      }`}
                      disabled={isSubmitted}
                    >
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)})
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Fill-in-the-blank Question
            <div>
              <h3 className="text-lg font-medium text-white mb-6">Complete the statement:</h3>
              <div className="space-y-6">
                <div className="text-lg leading-relaxed">
                  {(currentQuestion as FillBlankQuestion).text.split('______').map((part, index, array) => (
                    <span key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <input
                          type="text"
                          value={currentAnswer?.blankAnswers?.[index] || ''}
                          onChange={(e) => handleFillBlankAnswer(index, e.target.value)}
                          className="inline-block mx-2 px-3 py-1 bg-gray-700 border border-gray-600 text-white focus:border-emerald-500 focus:outline-none min-w-[120px]"
                          placeholder={`Blank ${index + 1}`}
                          disabled={isSubmitted}
                        />
                      )}
                    </span>
                  ))}
                </div>

                {/* Hints */}
                {(currentQuestion as FillBlankQuestion).blanks.some(blank => blank.hint) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Hints:</p>
                    {(currentQuestion as FillBlankQuestion).blanks.map((blank, index) => 
                      blank.hint && (
                        <div key={index} className="text-sm text-gray-500">
                          Blank {index + 1}: {blank.hint}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between" style={staggerDelay(2)}>
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: quiz.questions.length }, (_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentQuestionIndex(index);
                setQuestionStartTime(Date.now());
              }}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-emerald-600 text-white'
                  : answers.has(quiz.questions[index].id)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {isLastQuestion ? (
          <button
            onClick={submitQuiz}
            disabled={!currentAnswer}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Flag className="w-4 h-4" />
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={goToNextQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700 text-center" style={staggerDelay(3)}>
        <p className="text-sm text-gray-500">
          💡 Use arrow keys to navigate • Click question numbers to jump • Must answer current question to submit
        </p>
      </div>
    </div>
  );
};