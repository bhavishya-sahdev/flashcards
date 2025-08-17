'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Save, 
  Trash2, 
  AlertTriangle,
  Calendar,
  Bell,
  Target,
  BookOpen,
  Archive
} from 'lucide-react'
import { UserRoadmap } from '@/lib/types'

interface RoadmapSettingsProps {
  roadmap: UserRoadmap
  onUpdateRoadmap: (updates: Partial<UserRoadmap>) => Promise<void>
  onDeleteRoadmap: () => Promise<void>
  onArchiveRoadmap: () => Promise<void>
}

export function RoadmapSettings({ 
  roadmap, 
  onUpdateRoadmap, 
  onDeleteRoadmap,
  onArchiveRoadmap
}: RoadmapSettingsProps) {
  const [customName, setCustomName] = useState(roadmap.customName || '')
  const [customDescription, setCustomDescription] = useState(roadmap.customDescription || '')
  const [targetDate, setTargetDate] = useState(
    roadmap.targetCompletionDate ? roadmap.targetCompletionDate.toISOString().split('T')[0] : ''
  )
  const [isActive, setIsActive] = useState(roadmap.isActive)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdateRoadmap({
        customName: customName.trim() || undefined,
        customDescription: customDescription.trim() || undefined,
        targetCompletionDate: targetDate ? new Date(targetDate) : undefined,
        isActive,
        isCustomized: !!(customName.trim() || customDescription.trim())
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await onDeleteRoadmap()
    } catch (error) {
      console.error('Failed to delete roadmap:', error)
    }
  }

  const handleArchive = async () => {
    try {
      await onArchiveRoadmap()
      setShowArchiveConfirm(false)
    } catch (error) {
      console.error('Failed to archive roadmap:', error)
    }
  }

  const hasChanges = 
    customName !== (roadmap.customName || '') ||
    customDescription !== (roadmap.customDescription || '') ||
    targetDate !== (roadmap.targetCompletionDate ? roadmap.targetCompletionDate.toISOString().split('T')[0] : '') ||
    isActive !== roadmap.isActive

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Roadmap Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Name */}
          <div className="space-y-2">
            <Label htmlFor="roadmap-name" className="text-sm font-medium text-gray-300">
              Custom Name
            </Label>
            <Input
              id="roadmap-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={roadmap.template.name}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400">
              Leave empty to use the default name: "{roadmap.template.name}"
            </p>
          </div>

          {/* Custom Description */}
          <div className="space-y-2">
            <Label htmlFor="roadmap-description" className="text-sm font-medium text-gray-300">
              Custom Description
            </Label>
            <Textarea
              id="roadmap-description"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder={roadmap.template.description}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[80px] resize-none"
            />
            <p className="text-xs text-gray-400">
              Customize the description to match your learning goals
            </p>
          </div>

          {/* Target Completion Date */}
          <div className="space-y-2">
            <Label htmlFor="target-date" className="text-sm font-medium text-gray-300">
              Target Completion Date
            </Label>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <p className="text-xs text-gray-400">
              Set a target date to help track your progress and stay motivated
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium text-white">Active Roadmap</p>
                <p className="text-sm text-gray-400">
                  Active roadmaps appear in your dashboard and receive notifications
                </p>
              </div>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Roadmap Information */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Roadmap Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Original Template</p>
              <p className="text-white font-medium">{roadmap.template.name}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Category</p>
              <p className="text-white font-medium">{roadmap.template.category}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Difficulty Level</p>
              <p className="text-white font-medium">{roadmap.template.difficultyLevel}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Estimated Time</p>
              <p className="text-white font-medium">
                {roadmap.template.totalEstimatedTime ? `${roadmap.template.totalEstimatedTime}h` : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Started Date</p>
              <p className="text-white font-medium">
                {roadmap.startedAt ? roadmap.startedAt.toLocaleDateString() : 'Not started'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Last Accessed</p>
              <p className="text-white font-medium">
                {roadmap.lastAccessedAt.toLocaleDateString()}
              </p>
            </div>
          </div>

          {roadmap.template.tags && roadmap.template.tags.length > 0 && (
            <div>
              <p className="text-gray-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {roadmap.template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded border border-blue-600/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-900/20 border-red-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Archive Roadmap */}
          <div className="flex items-center justify-between p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
            <div>
              <p className="font-medium text-yellow-400">Archive Roadmap</p>
              <p className="text-sm text-gray-400">
                Archive this roadmap to hide it from your active list while preserving progress
              </p>
            </div>
            <Button
              onClick={() => setShowArchiveConfirm(true)}
              variant="outline"
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          </div>

          {showArchiveConfirm && (
            <div className="p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
              <p className="text-sm text-yellow-300 mb-4">
                Are you sure you want to archive this roadmap? You can always restore it later.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleArchive}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Archive Roadmap
                </Button>
                <Button
                  onClick={() => setShowArchiveConfirm(false)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Delete Roadmap */}
          <div className="flex items-center justify-between p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
            <div>
              <p className="font-medium text-red-400">Delete Roadmap</p>
              <p className="text-sm text-gray-400">
                Permanently delete this roadmap and all associated progress. This action cannot be undone.
              </p>
            </div>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
              <p className="text-sm text-red-300 mb-4">
                <strong>This action cannot be undone.</strong> This will permanently delete your roadmap 
                and all progress data. Are you absolutely sure?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDelete}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Forever
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}