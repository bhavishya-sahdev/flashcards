'use client'

import React, { useState } from 'react'
import { Plus, FolderPlus, Play, BarChart3, Settings, Sparkles } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { CreateFolderModal } from '../CreateFolderModal'
import { FolderGenerator } from '../FolderGenerator'
import { useFolders } from '@/hooks/useFolders'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

export function QuickActions() {
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [showGenerateModal, setShowGenerateModal] = useState(false)
	const { createFolder } = useFolders()
	const router = useRouter()

	const handleCreateFolder = async (name: string, description: string) => {
		try {
			const newFolder = await createFolder(name, description)
			router.push(`/folders/${newFolder.id}`)
		} catch (error) {
			console.error('Failed to create folder:', error)
			throw error
		}
	}

	const handleGeneratedFolder = (folder: any) => {
		setShowGenerateModal(false)
		router.push(`/folders/${folder.id}`)
	}

	const actions = [
		{
			title: 'AI Generate Folder',
			description: 'Create a folder with AI-generated flashcards',
			icon: Sparkles,
			iconColor: 'text-white',
			onClick: () => setShowGenerateModal(true),
			primary: true
		},
		{
			title: 'New Folder',
			description: 'Create an empty study folder',
			icon: FolderPlus,
			iconColor: 'text-blue-400',
			onClick: () => setShowCreateModal(true)
		},
		{
			title: 'Quick Study',
			description: 'Study due cards across all folders',
			icon: Play,
			iconColor: 'text-emerald-400',
			href: '/study'
		},
		{
			title: 'Analytics',
			description: 'View your study progress',
			icon: BarChart3,
			iconColor: 'text-purple-400',
			href: '/analytics'
		},
		{
			title: 'Settings',
			description: 'Customize your experience',
			icon: Settings,
			iconColor: 'text-gray-400',
			href: '/settings'
		}
	]

	return (
		<>
			<DashboardCard title="Quick Actions" icon={Plus} iconColor="text-emerald-400">
				<div className="space-y-2">
					{actions.map((action) => {
						const content = (
							<div className="flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors cursor-pointer group">
								<action.icon className={`w-5 h-5 ${action.iconColor}`} />
								<div className="flex-1 min-w-0">
									<div className="font-medium text-white">{action.title}</div>
									<div className="text-sm text-gray-400">{action.description}</div>
								</div>
							</div>
						)

						if (action.href) {
							return (
								<Link key={action.title} href={action.href}>
									{content}
								</Link>
							)
						}

						return (
							<button
								key={action.title}
								onClick={action.onClick}
								className="text-left w-full"
							>
								{content}
							</button>
						)
					})}
				</div>
			</DashboardCard>

			<CreateFolderModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onCreateFolder={handleCreateFolder}
			/>

			<Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
				<DialogContent className="bg-gray-900 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
					<FolderGenerator
						onFolderGenerated={handleGeneratedFolder}
						onCancel={() => setShowGenerateModal(false)}
						mounted={true}
					/>
				</DialogContent>
			</Dialog>
		</>
	)
}