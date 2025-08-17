'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Trophy, 
  Calendar,
  Brain,
  Zap,
  CheckCircle,
  BarChart3,
  Activity,
  Flame
} from 'lucide-react'
import { UserRoadmap, RoadmapProgressSummary } from '@/lib/types'

interface RoadmapAnalyticsProps {
  userRoadmaps: UserRoadmap[]
  getRoadmapProgress: (roadmap: UserRoadmap) => RoadmapProgressSummary
}

export function RoadmapAnalytics({ userRoadmaps, getRoadmapProgress }: RoadmapAnalyticsProps) {
  // Calculate overall statistics across all roadmaps
  const overallStats = userRoadmaps.reduce((acc, roadmap) => {
    const progress = getRoadmapProgress(roadmap)
    return {
      totalTopics: acc.totalTopics + progress.totalTopics,
      completedTopics: acc.completedTopics + progress.completedTopics,
      inProgressTopics: acc.inProgressTopics + progress.inProgressTopics,
      totalTimeSpent: acc.totalTimeSpent + progress.totalTimeSpent,
      totalRoadmaps: acc.totalRoadmaps + 1,
      activeRoadmaps: acc.activeRoadmaps + (roadmap.isActive ? 1 : 0),
    }
  }, {
    totalTopics: 0,
    completedTopics: 0,
    inProgressTopics: 0,
    totalTimeSpent: 0,
    totalRoadmaps: 0,
    activeRoadmaps: 0,
  })

  const overallProgress = overallStats.totalTopics > 0 
    ? Math.round((overallStats.completedTopics / overallStats.totalTopics) * 100)
    : 0

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStreakData = () => {
    const allProgress = userRoadmaps.flatMap(roadmap => roadmap.topicProgress)
    const studyDates = allProgress
      .filter(p => p.lastStudiedAt)
      .map(p => p.lastStudiedAt!)
      .sort((a, b) => b.getTime() - a.getTime())

    if (studyDates.length === 0) return { current: 0, best: 0, lastStudy: null }

    const today = new Date()
    const lastStudy = studyDates[0]
    const daysSinceLastStudy = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))
    
    let currentStreak = 0
    let bestStreak = 0
    
    if (daysSinceLastStudy <= 1) { // If studied today or yesterday
      currentStreak = 1
      let currentDate = new Date(lastStudy)
      
      for (let i = 1; i < studyDates.length; i++) {
        const prevDate = studyDates[i]
        const daysBetween = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysBetween === 1) {
          currentStreak++
          currentDate = prevDate
        } else {
          break
        }
      }
    }

    // Calculate best streak (simplified)
    bestStreak = Math.max(currentStreak, Math.floor(studyDates.length / 7)) // Rough estimate

    return { current: currentStreak, best: bestStreak, lastStudy }
  }

  const streakData = getStreakData()

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{overallProgress}%</p>
                <p className="text-sm text-gray-400">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{overallStats.completedTopics}</p>
                <p className="text-sm text-gray-400">Topics Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{formatTime(overallStats.totalTimeSpent)}</p>
                <p className="text-sm text-gray-400">Time Invested</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{streakData.current}</p>
                <p className="text-sm text-gray-400">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Breakdown */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Progress Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Completed Topics</span>
                <span className="text-green-400 font-medium">{overallStats.completedTopics}</span>
              </div>
              <Progress 
                value={overallStats.totalTopics > 0 ? (overallStats.completedTopics / overallStats.totalTopics) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">In Progress Topics</span>
                <span className="text-blue-400 font-medium">{overallStats.inProgressTopics}</span>
              </div>
              <Progress 
                value={overallStats.totalTopics > 0 ? (overallStats.inProgressTopics / overallStats.totalTopics) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Remaining Topics</span>
                <span className="text-gray-400 font-medium">
                  {overallStats.totalTopics - overallStats.completedTopics - overallStats.inProgressTopics}
                </span>
              </div>
              <Progress 
                value={overallStats.totalTopics > 0 ? ((overallStats.totalTopics - overallStats.completedTopics - overallStats.inProgressTopics) / overallStats.totalTopics) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Study Streaks */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Study Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-600/10 border border-orange-600/20 rounded-lg">
                <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-orange-400">{streakData.current}</p>
                <p className="text-sm text-gray-400">Current Streak</p>
              </div>

              <div className="text-center p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">{streakData.best}</p>
                <p className="text-sm text-gray-400">Best Streak</p>
              </div>
            </div>

            {streakData.lastStudy && (
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-400">Last Study Session</p>
                <p className="text-white font-medium">
                  {streakData.lastStudy.toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Roadmap Details */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Roadmap Progress Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userRoadmaps.map((roadmap) => {
              const progress = getRoadmapProgress(roadmap)
              const progressPercentage = progress.totalTopics > 0 
                ? Math.round((progress.completedTopics / progress.totalTopics) * 100)
                : 0

              return (
                <div key={roadmap.id} className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {roadmap.customName || roadmap.template.name}
                      </h3>
                      <p className="text-sm text-gray-400">{roadmap.template.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={roadmap.isActive ? 'border-green-600 text-green-400' : 'border-gray-600 text-gray-400'}
                      >
                        {roadmap.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-400">Progress</p>
                      <p className="text-lg font-semibold text-blue-400">{progressPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Completed</p>
                      <p className="text-lg font-semibold text-green-400">
                        {progress.completedTopics}/{progress.totalTopics}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Time Spent</p>
                      <p className="text-lg font-semibold text-purple-400">
                        {formatTime(progress.totalTimeSpent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Streak</p>
                      <p className="text-lg font-semibold text-orange-400">{progress.currentStreak}</p>
                    </div>
                  </div>

                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}