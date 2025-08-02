'use client'

import React, { useState } from 'react'
import { Plus, Save, X } from 'lucide-react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateFolderModalProps {
	isOpen: boolean
	onClose: () => void
	onCreateFolder: (name: string, description: string) => Promise<void>
	loading?: boolean
}

export function CreateFolderModal({
	isOpen,
	onClose,
	onCreateFolder,
	loading = false
}: CreateFolderModalProps) {
	const [folderName, setFolderName] = useState('')
	const [folderDescription, setFolderDescription] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!folderName.trim()) return

		setIsSubmitting(true)
		try {
			await onCreateFolder(folderName.trim(), folderDescription.trim())
			// Reset form
			setFolderName('')
			setFolderDescription('')
			onClose()
		} catch (error) {
			console.error('Failed to create folder:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		if (!isSubmitting) {
			setFolderName('')
			setFolderDescription('')
			onClose()
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="bg-gray-900 text-white max-w-md border-0">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						<Plus className="w-5 h-5 text-blue-400" />
						Create New Folder
					</DialogTitle>
					<DialogDescription className="text-gray-400">
						Create a new folder to organize your flashcards by topic or subject.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="folder-name" className="text-sm font-medium text-gray-300">
							Folder Name *
						</Label>
						<Input
							id="folder-name"
							type="text"
							value={folderName}
							onChange={(e) => setFolderName(e.target.value)}
							placeholder="e.g., JavaScript Fundamentals"
							className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
							disabled={isSubmitting}
							autoFocus
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="folder-description" className="text-sm font-medium text-gray-300">
							Description
						</Label>
						<textarea
							id="folder-description"
							value={folderDescription}
							onChange={(e) => setFolderDescription(e.target.value)}
							placeholder="e.g., Basic JavaScript concepts, syntax, and best practices"
							className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none h-20 resize-none"
							disabled={isSubmitting}
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<Button
							type="submit"
							disabled={!folderName.trim() || isSubmitting}
							className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
						>
							{isSubmitting ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
									Creating...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Create Folder
								</>
							)}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting}
							className="border-gray-700 text-gray-300 hover:bg-gray-800"
						>
							<X className="w-4 h-4 mr-2" />
							Cancel
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}