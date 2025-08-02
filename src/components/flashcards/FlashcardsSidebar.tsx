'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, BarChart3, Settings, FolderOpen, Plus, BookIcon } from 'lucide-react'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useFolders } from '@/hooks/useFolders'
import { UnifiedFolderModal } from './UnifiedFolderModal'

export function FlashcardsSidebar() {
	const pathname = usePathname()
	const router = useRouter()
	const { folders, loading, createFolder } = useFolders()
	const [showCreateModal, setShowCreateModal] = useState(false)

	const isActive = (path: string) => {
		if (path === '/') {
			return pathname === '/'
		}
		if (pathname === path) return true
		if (pathname.startsWith(path + '/')) return true
		return false
	}

	const handleCreateFolder = async (name: string, description: string) => {
		try {
			const newFolder = await createFolder(name, description)
			// Navigate to the newly created folder
			router.push(`/folders/${newFolder.id}`)
		} catch (error) {
			console.error('Failed to create folder:', error)
			throw error
		}
	}

	const handleFolderGenerated = (folder: { id: string; name: string; description: string; flashcardCount: number }) => {
		// Navigate to the newly generated folder
		router.push(`/folders/${folder.id}`)
	}

	const mainMenuItems = [
		{
			title: 'Home',
			icon: Home,
			href: '/',
		},
		{
			title: 'Quick Study',
			icon: BookIcon,
			href: '/study',
		},
		{
			title: 'Analytics',
			icon: BarChart3,
			href: '/analytics',
		},
		{
			title: 'Settings',
			icon: Settings,
			href: '/settings',
		},
	]

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-1">
					<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
						<FolderOpen className="w-4 h-4 text-white" />
					</div>
					<div>
						<h2 className="text-sm font-semibold">Flashcards</h2>
						<p className="text-xs text-muted-foreground">Study Platform</p>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainMenuItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={isActive(item.href)}
									>
										<Link href={item.href}>
											<item.icon className="w-4 h-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Folders</SidebarGroupLabel>
					<SidebarGroupAction onClick={() => setShowCreateModal(true)} title="Add New Folder">
						<Plus className="w-4 h-4" />
					</SidebarGroupAction>
					<SidebarGroupContent>
						<SidebarMenu>
							{loading ? (
								<SidebarMenuItem>
									<SidebarMenuButton disabled>
										<div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
										<span>Loading...</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							) : folders.length === 0 ? (
								<SidebarMenuItem>
									<SidebarMenuButton disabled>
										<FolderOpen className="w-4 h-4 text-muted-foreground" />
										<span className="text-muted-foreground">No folders</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							) : (
								folders.map((folder) => (
									<SidebarMenuItem key={folder.id}>
										<SidebarMenuButton
											asChild
											isActive={isActive(`/folders/${folder.id}`)}
										>
											<Link href={`/folders/${folder.id}`}>
												<FolderOpen className="w-4 h-4" />
												<span className='line-clamp-1' title={folder.name}>{folder.name}</span>
												<span className="ml-auto shrink-0 text-xs text-muted-foreground">
													{folder.flashcards.length}
												</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<UnifiedFolderModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onCreateFolder={handleCreateFolder}
				onFolderGenerated={handleFolderGenerated}
				loading={loading}
			/>
		</Sidebar>
	)
}