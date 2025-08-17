'use client'

import React from 'react'
import { RoadmapAnalytics } from './RoadmapAnalytics'
import useRoadmaps from '@/hooks/useRoadmaps'
import { useSession } from '@/lib/auth-client'
import { Loader2, AlertCircle, Brain, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function RoadmapAnalyticsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { userRoadmaps, loading, error, getRoadmapProgress } = useRoadmaps()

  const handleBack = () => {
    router.push('/roadmap')
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to view your learning analytics.</p>
          <Button onClick={() => router.push('/roadmap')} className="bg-blue-600 hover:bg-blue-700">
            Go to Roadmap
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline" className="border-gray-600 text-gray-300">
              Try Again
            </Button>
            <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
              Back to Roadmap
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (userRoadmaps.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">No Roadmaps Yet</h1>
          <p className="text-gray-400 text-lg mb-8">
            Start a roadmap to see your learning analytics and progress insights.
          </p>
          <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Roadmap
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roadmap
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Learning Analytics
                </h1>
                <p className="text-gray-400 mt-1">Track your progress and insights across all roadmaps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Component */}
        <RoadmapAnalytics 
          userRoadmaps={userRoadmaps} 
          getRoadmapProgress={getRoadmapProgress}
        />
      </div>
    </div>
  )
}