'use client'

import React, { useState } from 'react'
import { Plus, FolderPlus, Play, BarChart3, Settings } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { CreateFolderModal } from '../CreateFolderModal'
import { useFolders } from '@/hooks/useFolders'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function QuickActions() {
	const [showCreateModal, setShowCreateModal] = useState(false)
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

	const actions = [
		{
			title: 'New Folder',
			description: 'Create a new study folder',
			icon: FolderPlus,
			iconColor: 'text-blue-400',
			onClick: () => setShowCreateModal(true),
			primary: true
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
		</>
	)
}