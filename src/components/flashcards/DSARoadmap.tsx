'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Brain, 
  TreePine, 
  GitBranch, 
  Zap, 
  Target,
  BookOpen,
  Star,
  ArrowRight,
  Trophy,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import useRoadmaps from '@/hooks/useRoadmaps'
import { UserRoadmap, UserTopicProgress } from '@/lib/types'

interface TopicWithProgress {
  id: string
  name: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTimeHours: number
  prerequisites: string[]
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  icon: React.ComponentType<{ className?: string }>
  subtopics: string[]
  practiceProblems: number
  progress?: UserTopicProgress
  progressPercentage: number
  timeSpent: number
}

const getTopicIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'arrays & strings': return BookOpen
    case 'linked lists': return GitBranch
    case 'stacks & queues': return Target
    case 'trees & bst': return TreePine
    case 'heaps': return Star
    case 'graphs': return Brain
    case 'dynamic programming': return Zap
    case 'advanced topics': return Trophy
    default: return Circle
  }
}

const formatEstimatedTime = (hours: number): string => {
  if (hours < 24) {
    return `${hours} hours`
  }
  const weeks = Math.ceil(hours / 40) // Assuming 40 hours per week
  return weeks === 1 ? '1 week' : `${weeks} weeks`
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'bg-green-100 text-green-800 border-green-200'
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'Advanced': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />
    case 'available': return <Circle className="w-5 h-5 text-gray-400" />
    case 'locked': return <Circle className="w-5 h-5 text-gray-300" />
    default: return <Circle className="w-5 h-5 text-gray-300" />
  }
}

export function DSARoadmap() {
  const { data: session } = useSession()
  const {
    userRoadmaps,
    loading,
    error,
    startRoadmap,
    updateTopicProgress,
    initializeDSARoadmap,
    getRoadmapProgress
  } = useRoadmaps()

  const [dsaRoadmap, setDsaRoadmap] = useState<UserRoadmap | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    // Find the DSA roadmap in user's roadmaps
    const dsa = userRoadmaps.find(roadmap => 
      roadmap.template.name === 'DSA Fundamentals'
    )
    setDsaRoadmap(dsa || null)
  }, [userRoadmaps])

  const handleInitializeDSA = async () => {
    if (!session?.user) {
      return
    }

    setIsInitializing(true)
    try {
      await initializeDSARoadmap()
    } catch (error) {
      console.error('Failed to initialize DSA roadmap:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleStartTopic = async (topicId: string) => {
    if (!dsaRoadmap) return

    setActionLoading(topicId)
    try {
      await updateTopicProgress(dsaRoadmap.id, topicId, {
        status: 'in_progress'
      })
    } catch (error) {
      console.error('Failed to start topic:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleContinueTopic = (topicId: string) => {
    // Navigate to topic detail page
    window.location.href = `/roadmap/topic/${topicId}`
  }

  // Transform roadmap data for display
  const getRoadmapData = (): TopicWithProgress[] => {
    if (!dsaRoadmap) return []

    return dsaRoadmap.template.topics.map(topic => {
      const progress = dsaRoadmap.topicProgress.find(p => p.topicId === topic.id)
      const Icon = getTopicIcon(topic.name)
      
      return {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        difficulty: topic.difficulty,
        estimatedTimeHours: topic.estimatedTimeHours,
        prerequisites: [], // We'll handle this through the API
        status: progress?.status || 'locked',
        icon: Icon,
        subtopics: topic.subtopics,
        practiceProblems: topic.practiceProblemsCount,
        progress,
        progressPercentage: progress?.progressPercentage || 0,
        timeSpent: progress?.timeSpent || 0
      }
    })
  }

  const roadmapData = getRoadmapData()
  const progressSummary = dsaRoadmap ? getRoadmapProgress(dsaRoadmap) : null

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Loading your roadmap...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Not authenticated or no DSA roadmap
  if (!session?.user || !dsaRoadmap) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">DSA Learning Roadmap</h1>
          <p className="text-gray-400 text-lg mb-8">
            {!session?.user 
              ? "Sign in to start your personalized DSA learning journey with progress tracking."
              : "Initialize your DSA roadmap to start learning with a structured path."}
          </p>
          
          {session?.user ? (
            <Button
              onClick={handleInitializeDSA}
              disabled={isInitializing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Start DSA Roadmap
                </>
              )}
            </Button>
          ) : (
            <p className="text-gray-500">Please sign in to continue.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                DSA Learning Roadmap
              </h1>
              <p className="text-gray-400 mt-1">Master Data Structures & Algorithms step by step</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600/20 flex items-center justify-center rounded">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">{progressSummary?.completedTopics || 0}</p>
                    <p className="text-sm text-gray-400">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 flex items-center justify-center rounded">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{progressSummary?.availableTopics || 0}</p>
                    <p className="text-sm text-gray-400">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600/20 flex items-center justify-center rounded">
                    <Circle className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-400">{progressSummary?.lockedTopics || 0}</p>
                    <p className="text-sm text-gray-400">Locked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600/20 flex items-center justify-center rounded">
                    <Target className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">
                      {roadmapData.reduce((sum, topic) => sum + topic.practiceProblems, 0)}
                    </p>
                    <p className="text-sm text-gray-400">Total Problems</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-6">
          {roadmapData.map((topic, index) => {
            const Icon = topic.icon
            const isLocked = topic.status === 'locked'
            const isCompleted = topic.status === 'completed'
            const isInProgress = topic.status === 'in_progress'
            const isAvailable = topic.status === 'available'

            return (
              <div key={topic.id} className="relative">
                {/* Connection line */}
                {index < roadmapData.length - 1 && (
                  <div className="absolute left-6 top-20 w-0.5 h-12 bg-gray-700" />
                )}
                
                <Card className={`bg-gray-900/50 border-gray-800 transition-all duration-200 ${
                  isLocked ? 'opacity-60' : 'hover:border-gray-700'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Status indicator */}
                      <div className="flex flex-col items-center">
                        {getStatusIcon(topic.status)}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mt-2 ${
                          isCompleted ? 'bg-green-600/20' :
                          isInProgress ? 'bg-blue-600/20' :
                          isAvailable ? 'bg-gray-600/20' :
                          'bg-gray-700/20'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isCompleted ? 'text-green-400' :
                            isInProgress ? 'text-blue-400' :
                            isAvailable ? 'text-gray-400' :
                            'text-gray-500'
                          }`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1">{topic.name}</h3>
                            <p className="text-gray-400 mb-2">{topic.description}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className={getDifficultyColor(topic.difficulty)}>
                                {topic.difficulty}
                              </Badge>
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatEstimatedTime(topic.estimatedTimeHours)}
                              </Badge>
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                {topic.practiceProblems} problems
                              </Badge>
                              {topic.progressPercentage > 0 && (
                                <Badge variant="outline" className="border-blue-600 text-blue-300">
                                  {topic.progressPercentage}% complete
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Action button */}
                          <div className="ml-4">
                            {isAvailable && (
                              <Button
                                onClick={() => handleStartTopic(topic.id)}
                                disabled={actionLoading === topic.id}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {actionLoading === topic.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Starting...
                                  </>
                                ) : (
                                  <>
                                    Start Learning
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </>
                                )}
                              </Button>
                            )}
                            {isInProgress && (
                              <Button
                                onClick={() => handleContinueTopic(topic.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            )}
                            {isCompleted && (
                              <Button
                                onClick={() => handleContinueTopic(topic.id)}
                                variant="outline"
                                className="border-green-600 text-green-400 hover:bg-green-600/10"
                              >
                                Review
                                <CheckCircle className="w-4 h-4 ml-2" />
                              </Button>
                            )}
                            {isLocked && (
                              <Button disabled className="bg-gray-700 text-gray-400">
                                Locked
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Subtopics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {topic.subtopics.map((subtopic, subIndex) => (
                            <div key={subIndex} className="flex items-center gap-2 text-sm text-gray-400">
                              <div className="w-1 h-1 bg-gray-500 rounded-full" />
                              {subtopic}
                            </div>
                          ))}
                        </div>

                        {/* Time spent and progress */}
                        {topic.timeSpent > 0 && (
                          <div className="text-sm text-gray-500 mt-2">
                            <span className="font-medium">Time spent: </span>
                            {Math.floor(topic.timeSpent / 60)}h {topic.timeSpent % 60}m
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/30">
            <CardContent className="p-6">
              <Brain className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Start Your Journey?</h3>
              <p className="text-gray-400 mb-4">
                {!progressSummary || progressSummary.completedTopics === 0 
                  ? "Begin with Arrays & Strings to build a solid foundation in data structures and algorithms."
                  : `Continue your learning journey! You've completed ${progressSummary.completedTopics} out of ${progressSummary.totalTopics} topics.`}
              </p>
              <Button 
                onClick={() => {
                  const nextTopic = roadmapData.find(t => t.status === 'available')
                  if (nextTopic) handleStartTopic(nextTopic.id)
                }}
                disabled={!roadmapData.some(t => t.status === 'available')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50"
              >
                {!progressSummary || progressSummary.completedTopics === 0 ? 'Start Your DSA Journey' : 'Continue Learning'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}