'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  BookOpen, 
  CheckCircle, 
  Play, 
  Pause,
  Save,
  Bookmark,
  BookmarkCheck,
  Brain,
  Trophy,
  Calendar,
  Timer,
  Lightbulb
} from 'lucide-react'
import { RoadmapTopic, UserTopicProgress } from '@/lib/types'

interface TopicDetailProps {
  topic: RoadmapTopic
  progress: UserTopicProgress
  onBack: () => void
  onUpdateProgress: (updates: Partial<UserTopicProgress>) => Promise<void>
  onStartPractice: () => void
}

export function TopicDetail({ 
  topic, 
  progress, 
  onBack, 
  onUpdateProgress,
  onStartPractice 
}: TopicDetailProps) {
  const [isStudying, setIsStudying] = useState(false)
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null)
  const [localNotes, setLocalNotes] = useState(progress.userNotes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'in_progress': return 'text-blue-400'
      case 'available': return 'text-gray-400'
      case 'locked': return 'text-gray-500'
      default: return 'text-gray-400'
    }
  }

  const handleStartStudy = async () => {
    setIsStudying(true)
    setStudyStartTime(new Date())
    
    if (progress.status === 'available') {
      await onUpdateProgress({ status: 'in_progress' })
    }
  }

  const handleStopStudy = async () => {
    if (studyStartTime) {
      const studyTimeMinutes = Math.floor((new Date().getTime() - studyStartTime.getTime()) / (1000 * 60))
      const newTimeSpent = progress.timeSpent + studyTimeMinutes
      
      await onUpdateProgress({ 
        timeSpent: newTimeSpent,
        lastStudiedAt: new Date()
      })
    }
    
    setIsStudying(false)
    setStudyStartTime(null)
  }

  const handleCompleteTopicBn = async () => {
    await onUpdateProgress({ 
      status: 'completed',
      progressPercentage: 100,
      completedAt: new Date()
    })
  }

  const handleBookmarkToggle = async () => {
    await onUpdateProgress({ 
      isBookmarked: !progress.isBookmarked 
    })
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    try {
      await onUpdateProgress({ userNotes: localNotes })
    } finally {
      setIsSavingNotes(false)
    }
  }

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never'
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roadmap
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{topic.name}</h1>
            <p className="text-gray-400">{topic.description}</p>
          </div>

          <Button
            onClick={handleBookmarkToggle}
            variant="outline"
            size="sm"
            className={`border-gray-700 hover:bg-gray-800 ${
              progress.isBookmarked ? 'text-yellow-400 border-yellow-600' : 'text-gray-400'
            }`}
          >
            {progress.isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Progress and Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  progress.status === 'completed' ? 'bg-green-600/20' :
                  progress.status === 'in_progress' ? 'bg-blue-600/20' :
                  'bg-gray-600/20'
                }`}>
                  {progress.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Target className={`w-4 h-4 ${getStatusColor(progress.status)}`} />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${getStatusColor(progress.status)}`}>
                    {progress.status === 'in_progress' ? 'In Progress' : 
                     progress.status === 'completed' ? 'Completed' :
                     progress.status === 'available' ? 'Available' : 'Locked'}
                  </p>
                  <p className="text-xs text-gray-500">Status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600/20 rounded flex items-center justify-center">
                  <Timer className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-400">
                    {formatTimeSpent(progress.timeSpent)}
                  </p>
                  <p className="text-xs text-gray-500">Time Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600/20 rounded flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-400">
                    {progress.practiceProblemsCompleted}/{topic.practiceProblemsCount}
                  </p>
                  <p className="text-xs text-gray-500">Problems</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600/20 rounded flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-400">
                    {progress.progressPercentage}%
                  </p>
                  <p className="text-xs text-gray-500">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-gray-900/50 border-gray-800 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <span className="text-sm text-gray-400">{progress.progressPercentage}% Complete</span>
            </div>
            <Progress 
              value={progress.progressPercentage} 
              className="h-2 mb-4"
            />
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Started: {formatDate(progress.startedAt)}</span>
              </div>
              {progress.completedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed: {formatDate(progress.completedAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last studied: {formatDate(progress.lastStudiedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Topic Overview */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Topic Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={getDifficultyColor(topic.difficulty)}>
                    {topic.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    <Clock className="w-3 h-3 mr-1" />
                    {topic.estimatedTimeHours} hours
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {topic.practiceProblemsCount} problems
                  </Badge>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  {topic.description}
                </p>
              </CardContent>
            </Card>

            {/* Subtopics */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topic.subtopics.map((subtopic, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                      {subtopic}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Learning Points */}
            {topic.keyLearningPoints && topic.keyLearningPoints.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Key Learning Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topic.keyLearningPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-3 text-gray-300">
                        <div className="w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-purple-400">{index + 1}</span>
                        </div>
                        {point}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Study Session */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-green-400" />
                  Study Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {!isStudying ? (
                    <Button
                      onClick={handleStartStudy}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Studying
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopStudy}
                      variant="outline"
                      className="border-orange-600 text-orange-400 hover:bg-orange-600/10"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      End Session
                    </Button>
                  )}
                  
                  <Button
                    onClick={onStartPractice}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Practice Problems
                  </Button>
                </div>

                {isStudying && studyStartTime && (
                  <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
                    <p className="text-green-400 text-sm font-medium">
                      Study session active since {studyStartTime.toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {progress.status !== 'completed' && (
                  <Button
                    onClick={handleCompleteTopicBn}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
                
                <Button
                  onClick={onStartPractice}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Practice Problems
                </Button>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Your Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  placeholder="Add your notes, insights, or reminders..."
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[120px] resize-none"
                />
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || localNotes === (progress.userNotes || '')}
                  size="sm"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Estimated Time</span>
                  <span className="text-white">{topic.estimatedTimeHours}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Time Invested</span>
                  <span className="text-white">{formatTimeSpent(progress.timeSpent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Problems Available</span>
                  <span className="text-white">{topic.practiceProblemsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Problems Completed</span>
                  <span className="text-white">{progress.practiceProblemsCompleted}</span>
                </div>
                {progress.averageScore !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Score</span>
                    <span className="text-white">{Math.round(progress.averageScore)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}