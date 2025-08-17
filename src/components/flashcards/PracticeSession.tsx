'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Target,
  Brain,
  Trophy,
  Zap,
  ArrowRight,
  RotateCcw,
  Flag
} from 'lucide-react'
import { RoadmapTopic, UserTopicProgress } from '@/lib/types'

interface PracticeSessionProps {
  topic: RoadmapTopic
  progress: UserTopicProgress
  onBack: () => void
  onUpdateProgress: (updates: Partial<UserTopicProgress>) => Promise<void>
}

// Mock practice problems - in a real app, these would come from the API
const generateMockProblems = (topic: RoadmapTopic) => {
  const problems = []
  const topicName = topic.name.toLowerCase()
  
  if (topicName.includes('array')) {
    problems.push(
      {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy" as const,
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        examples: [
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
        ],
        hints: ["Use a hash map to store complements", "Think about the time complexity"]
      },
      {
        id: 2,
        title: "Maximum Subarray",
        difficulty: "Medium" as const,
        description: "Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.",
        examples: [
          { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
          { input: "nums = [1]", output: "1" }
        ],
        hints: ["Consider using Kadane's algorithm", "Think about dynamic programming"]
      }
    )
  } else if (topicName.includes('linked')) {
    problems.push(
      {
        id: 3,
        title: "Reverse Linked List",
        difficulty: "Easy" as const,
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        examples: [
          { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
          { input: "head = [1,2]", output: "[2,1]" }
        ],
        hints: ["Use three pointers: prev, curr, next", "Consider both iterative and recursive approaches"]
      }
    )
  } else {
    // Generic problems for other topics
    problems.push(
      {
        id: 4,
        title: `${topic.name} - Basic Problem`,
        difficulty: "Easy" as const,
        description: `A fundamental problem related to ${topic.name.toLowerCase()}.`,
        examples: [
          { input: "Example input", output: "Example output" }
        ],
        hints: ["Think about the core concepts", "Start with a simple approach"]
      }
    )
  }
  
  return problems
}

interface PracticeProblem {
  id: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  description: string
  examples: { input: string; output: string }[]
  hints: string[]
}

export function PracticeSession({ 
  topic, 
  progress, 
  onBack, 
  onUpdateProgress 
}: PracticeSessionProps) {
  const [problems] = useState<PracticeProblem[]>(generateMockProblems(topic))
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [sessionStartTime] = useState(new Date())
  const [problemStartTime, setProblemStartTime] = useState(new Date())
  const [completedProblems, setCompletedProblems] = useState<number[]>([])
  const [skippedProblems, setSkippedProblems] = useState<number[]>([])
  const [showHints, setShowHints] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    completed: 0,
    timeSpent: 0
  })

  const currentProblem = problems[currentProblemIndex]
  const isLastProblem = currentProblemIndex === problems.length - 1

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleProblemComplete = async () => {
    const timeSpent = Math.floor((new Date().getTime() - problemStartTime.getTime()) / 1000)
    
    setCompletedProblems(prev => [...prev, currentProblem.id])
    setSessionStats(prev => ({
      ...prev,
      attempted: prev.attempted + 1,
      completed: prev.completed + 1,
      timeSpent: prev.timeSpent + timeSpent
    }))

    if (isLastProblem) {
      await handleSessionComplete()
    } else {
      handleNextProblem()
    }
  }

  const handleProblemSkip = () => {
    const timeSpent = Math.floor((new Date().getTime() - problemStartTime.getTime()) / 1000)
    
    setSkippedProblems(prev => [...prev, currentProblem.id])
    setSessionStats(prev => ({
      ...prev,
      attempted: prev.attempted + 1,
      timeSpent: prev.timeSpent + timeSpent
    }))

    if (isLastProblem) {
      handleSessionComplete()
    } else {
      handleNextProblem()
    }
  }

  const handleNextProblem = () => {
    setCurrentProblemIndex(prev => prev + 1)
    setProblemStartTime(new Date())
    setShowHints(false)
  }

  const handleSessionComplete = async () => {
    const totalSessionTime = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60))
    const newProblemsCompleted = progress.practiceProblemsCompleted + completedProblems.length
    const newTimeSpent = progress.timeSpent + totalSessionTime
    
    // Calculate new progress percentage
    const newProgressPercentage = Math.min(100, Math.floor((newProblemsCompleted / topic.practiceProblemsCount) * 100))
    
    await onUpdateProgress({
      practiceProblemsCompleted: newProblemsCompleted,
      timeSpent: newTimeSpent,
      progressPercentage: newProgressPercentage,
      lastStudiedAt: new Date()
    })

    // Show completion screen or navigate back
    onBack()
  }

  const progressPercentage = Math.floor(((currentProblemIndex + 1) / problems.length) * 100)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div>
              <h1 className="text-xl font-bold text-white">{topic.name} Practice</h1>
              <p className="text-gray-400 text-sm">
                Problem {currentProblemIndex + 1} of {problems.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Session Progress</p>
              <p className="text-lg font-semibold">{progressPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="bg-gray-900/50 border-gray-800 mb-6">
          <CardContent className="p-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Progress</span>
              <span>{currentProblemIndex + 1}/{problems.length} problems</span>
            </div>
          </CardContent>
        </Card>

        {/* Session Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600/20 rounded flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-400">{sessionStats.attempted}</p>
                  <p className="text-xs text-gray-400">Attempted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600/20 rounded flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-green-400">{sessionStats.completed}</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-600/20 rounded flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-400">{skippedProblems.length}</p>
                  <p className="text-xs text-gray-400">Skipped</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600/20 rounded flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-400">{Math.floor(sessionStats.timeSpent / 60)}m</p>
                  <p className="text-xs text-gray-400">Time Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Problem Card */}
        <Card className="bg-gray-900/50 border-gray-800 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{currentProblem.title}</CardTitle>
              <Badge variant="outline" className={getDifficultyColor(currentProblem.difficulty)}>
                {currentProblem.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Problem Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Problem Description</h3>
              <p className="text-gray-300 leading-relaxed">{currentProblem.description}</p>
            </div>

            {/* Examples */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Examples</h3>
              <div className="space-y-3">
                {currentProblem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">Input:</p>
                        <code className="text-green-400 text-sm">{example.input}</code>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">Output:</p>
                        <code className="text-blue-400 text-sm">{example.output}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Hints</h3>
                <Button
                  onClick={() => setShowHints(!showHints)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </Button>
              </div>
              
              {showHints && (
                <div className="space-y-2">
                  {currentProblem.hints.map((hint, index) => (
                    <div key={index} className="bg-yellow-600/10 border border-yellow-600/20 p-3 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-yellow-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-yellow-400">{index + 1}</span>
                        </div>
                        <p className="text-yellow-300 text-sm">{hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleProblemSkip}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:bg-gray-800"
          >
            <Flag className="w-4 h-4 mr-2" />
            Skip Problem
          </Button>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setProblemStartTime(new Date())
                setShowHints(false)
              }}
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Timer
            </Button>

            <Button
              onClick={handleProblemComplete}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLastProblem ? 'Complete Session' : 'Mark Complete'}
              {!isLastProblem && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>

        {/* Session Summary Modal could go here */}
      </div>
    </div>
  )
}