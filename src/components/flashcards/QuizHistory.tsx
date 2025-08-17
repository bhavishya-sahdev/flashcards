'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, Trophy, Target, Calendar, 
  Eye, RotateCcw, TrendingUp, Award,
  CheckCircle, XCircle, Filter, Search
} from 'lucide-react';

interface QuizHistoryItem {
  id: number;
  quizId: string;
  title: string;
  description?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  startedAt: string;
  completedAt: string;
  createdAt: string;
}

interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  recentQuizzes: QuizHistoryItem[];
}

interface QuizHistoryProps {
  folderId: string;
  folderName: string;
  onViewDetails: (quizResultId: number) => void;
  onRetakeQuiz: () => void;
  mounted?: boolean;
}

export const QuizHistory: React.FC<QuizHistoryProps> = ({
  folderId,
  folderName,
  onViewDetails,
  onRetakeQuiz,
  mounted = true,
}) => {
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'excellent' | 'good' | 'needs-improvement'>('all');

  useEffect(() => {
    fetchQuizHistory();
  }, [folderId]);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quiz/history/${folderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz history');
      }
      const data = await response.json();
      setQuizHistory(data.quizHistory);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      setError('Failed to load quiz history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = quizHistory.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScore = scoreFilter === 'all' || 
                        (scoreFilter === 'excellent' && quiz.score >= 90) ||
                        (scoreFilter === 'good' && quiz.score >= 70 && quiz.score < 90) ||
                        (scoreFilter === 'needs-improvement' && quiz.score < 70);
    
    return matchesSearch && matchesScore;
  });

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

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-900/50 text-emerald-400 border-emerald-800';
    if (score >= 70) return 'bg-amber-900/50 text-amber-400 border-amber-800';
    return 'bg-red-900/50 text-red-400 border-red-800';
  };

  const staggerDelay = (index: number) => ({
    transform: mounted ? 'translateY(0)' : 'translateY(10px)',
    opacity: mounted ? 1 : 0,
    transition: 'all 0.3s ease-out',
    transitionDelay: `${index * 50}ms`
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading quiz history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchQuizHistory}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white transition-colors rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (quizHistory.length === 0) {
    return (
      <div className="p-8 text-center">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Quiz History</h3>
        <p className="text-gray-400 mb-6">
          You haven't taken any quizzes for {folderName} yet. Start your first quiz to track your progress!
        </p>
        <button
          onClick={onRetakeQuiz}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium transition-colors rounded"
        >
          Take Your First Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" style={staggerDelay(0)}>
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalQuizzes}</div>
            <div className="text-sm text-gray-400">Total Quizzes</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
            <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.averageScore}%</div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
            <Award className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.bestScore}%</div>
            <div className="text-sm text-gray-400">Best Score</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{formatTime(stats.totalTimeSpent)}</div>
            <div className="text-sm text-gray-400">Total Time</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6" style={staggerDelay(1)}>
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white rounded focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Scores</option>
            <option value="excellent">Excellent (90%+)</option>
            <option value="good">Good (70-89%)</option>
            <option value="needs-improvement">Needs Work (&lt;70%)</option>
          </select>
        </div>
      </div>

      {/* Quiz History List */}
      <div className="space-y-4">
        {filteredHistory.map((quiz, index) => (
          <div
            key={quiz.id}
            className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg hover:border-gray-600 transition-colors"
            style={staggerDelay(index + 2)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-gray-400 text-sm mb-2">{quiz.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(quiz.completedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(quiz.timeSpent)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {quiz.correctAnswers}/{quiz.totalQuestions} correct
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 border rounded-full text-sm font-medium ${getScoreBadgeColor(quiz.score)}`}>
                  {quiz.score}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {quiz.score >= 90 ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : quiz.score >= 70 ? (
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-sm font-medium ${getScoreColor(quiz.score)}`}>
                  {quiz.score >= 90 ? 'Excellent!' : quiz.score >= 70 ? 'Good work!' : 'Room for improvement'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewDetails(quiz.id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors rounded"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center pt-6" style={staggerDelay(filteredHistory.length + 3)}>
        <button
          onClick={onRetakeQuiz}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium transition-colors rounded"
        >
          <RotateCcw className="w-4 h-4" />
          Take New Quiz
        </button>
      </div>

      {filteredHistory.length === 0 && quizHistory.length > 0 && (
        <div className="text-center py-8" style={staggerDelay(2)}>
          <p className="text-gray-400">No quizzes match your current filters.</p>
        </div>
      )}
    </div>
  );
};