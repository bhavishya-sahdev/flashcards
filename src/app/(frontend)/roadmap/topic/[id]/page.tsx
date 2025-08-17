'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopicDetail } from '@/components/flashcards/TopicDetail'
import useRoadmaps from '@/hooks/useRoadmaps'
import { useSession } from '@/lib/auth-client'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TopicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { userRoadmaps, loading, error, updateTopicProgress } = useRoadmaps()
  
  const topicId = params.id as string
  const [topic, setTopic] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [roadmapId, setRoadmapId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && userRoadmaps.length > 0) {
      // Find the topic across all user roadmaps
      for (const roadmap of userRoadmaps) {
        const foundTopic = roadmap.template.topics.find(t => t.id === topicId)
        const foundProgress = roadmap.topicProgress.find(p => p.topicId === topicId)
        
        if (foundTopic && foundProgress) {
          setTopic(foundTopic)
          setProgress(foundProgress)
          setRoadmapId(roadmap.id)
          break
        }
      }
    }
  }, [userRoadmaps, loading, topicId])

  const handleBack = () => {
    router.push('/roadmap')
  }

  const handleUpdateProgress = async (updates: any) => {
    if (!roadmapId) return
    
    try {
      const updatedProgress = await updateTopicProgress(roadmapId, topicId, updates)
      setProgress(updatedProgress)
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const handleStartPractice = () => {
    // Navigate to practice page
    router.push(`/roadmap/topic/${topicId}/practice`)
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to view topic details.</p>
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
          <p className="text-gray-400">Loading topic details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Topic</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/roadmap')} className="bg-blue-600 hover:bg-blue-700">
            Back to Roadmap
          </Button>
        </div>
      </div>
    )
  }

  if (!topic || !progress) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Topic Not Found</h2>
          <p className="text-gray-400 mb-4">The requested topic could not be found in your roadmaps.</p>
          <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
            Back to Roadmap
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TopicDetail
      topic={topic}
      progress={progress}
      onBack={handleBack}
      onUpdateProgress={handleUpdateProgress}
      onStartPractice={handleStartPractice}
    />
  )
}