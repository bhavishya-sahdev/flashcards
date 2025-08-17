'use client'

import React from 'react'
import { RoadmapSettings } from '@/components/flashcards/RoadmapSettings'
import useRoadmaps from '@/hooks/useRoadmaps'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Settings, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RoadmapSettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { userRoadmaps, loading, error } = useRoadmaps()

  // For now, show settings for the first (DSA) roadmap
  // In a full implementation, you might have a roadmap selector or URL parameter
  const dsaRoadmap = userRoadmaps.find(roadmap => 
    roadmap.template.name === 'DSA Fundamentals'
  )

  const handleBack = () => {
    router.push('/roadmap')
  }

  const handleUpdateRoadmap = async (updates: any) => {
    // This would typically call an API to update the roadmap
    console.log('Update roadmap:', updates)
    // For now, just show a success message
  }

  const handleDeleteRoadmap = async () => {
    // This would typically call an API to delete the roadmap
    console.log('Delete roadmap')
    // Navigate back after deletion
    router.push('/roadmap')
  }

  const handleArchiveRoadmap = async () => {
    // This would typically call an API to archive the roadmap
    console.log('Archive roadmap')
    await handleUpdateRoadmap({ isActive: false })
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to manage roadmap settings.</p>
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
          <p className="text-gray-400">Loading roadmap settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Settings</h2>
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

  if (!dsaRoadmap) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <Settings className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">No Roadmap Found</h1>
          <p className="text-gray-400 text-lg mb-8">
            You don't have any roadmaps to configure. Start a roadmap first.
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
      <div className="max-w-4xl mx-auto">
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Roadmap Settings
                </h1>
                <p className="text-gray-400 mt-1">
                  Customize your {dsaRoadmap.customName || dsaRoadmap.template.name} roadmap
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Component */}
        <RoadmapSettings
          roadmap={dsaRoadmap}
          onUpdateRoadmap={handleUpdateRoadmap}
          onDeleteRoadmap={handleDeleteRoadmap}
          onArchiveRoadmap={handleArchiveRoadmap}
        />
      </div>
    </div>
  )
}