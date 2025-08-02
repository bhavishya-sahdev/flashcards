'use client'

import React from 'react'
import Link from 'next/link'
import { FolderOpen, BookOpen, Clock, Brain, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { FlashcardFolder } from '@/lib/types'

interface FolderCardProps {
	folder: FlashcardFolder
	onEdit?: () => void
	onDelete?: () => void
	className?: string
}

export function FolderCard({ folder, onEdit, onDelete, className = '' }: FolderCardProps) {
	const totalCards = folder.flashcards.length
	const cardsDue = folder.flashcards.filter(card =>
		new Date(card.nextReviewDate) <= new Date()
	).length
	const cardsLearning = folder.flashcards.filter(card => card.isLearning).length

	return (
		<div className={`group bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all duration-200 overflow-hidden ${className}`}>
			{/* Card Header */}
			<div className="p-6 pb-4">
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
							<FolderOpen className="w-5 h-5 text-white" />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-white text-lg truncate">{folder.name}</h3>
							<p className="text-sm text-gray-400 line-clamp-2 mt-1">{folder.description}</p>
						</div>
					</div>

					{/* Actions Menu */}
					{(onEdit || onDelete) && (
						<div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
							<div className="flex items-center gap-1">
								{onEdit && (
									<button
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											onEdit()
										}}
										className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded transition-colors"
										title="Edit folder"
									>
										<Edit2 className="w-4 h-4" />
									</button>
								)}
								{onDelete && totalCards === 0 && (
									<button
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											onDelete()
										}}
										className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
										title="Delete folder"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 mb-4">
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 mb-1">
							<BookOpen className="w-3 h-3 text-blue-400" />
							<span className="text-lg font-semibold text-white">{totalCards}</span>
						</div>
						<div className="text-xs text-gray-500">Total</div>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 mb-1">
							<Clock className="w-3 h-3 text-yellow-400" />
							<span className="text-lg font-semibold text-white">{cardsDue}</span>
						</div>
						<div className="text-xs text-gray-500">Due</div>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 mb-1">
							<Brain className="w-3 h-3 text-purple-400" />
							<span className="text-lg font-semibold text-white">{cardsLearning}</span>
						</div>
						<div className="text-xs text-gray-500">Learning</div>
					</div>
				</div>
			</div>

			{/* Study Button */}
			<div className="px-6 pb-6">
				<Link
					href={`/folders/${folder.id}`}
					className="block w-full"
				>
					<div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 transition-all duration-200 text-center group-hover:shadow-lg">
						<div className="flex items-center justify-center gap-2">
							<span>Study Now</span>
							{cardsDue > 0 && (
								<span className="bg-white/20 text-xs px-2 py-1 rounded-full">
									{cardsDue} due
								</span>
							)}
						</div>
					</div>
				</Link>
			</div>

			{/* Progress Bar */}
			{totalCards > 0 && (
				<div className="h-1 bg-gray-800">
					<div
						className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
						style={{
							width: `${((totalCards - cardsLearning) / totalCards) * 100}%`
						}}
					/>
				</div>
			)}
		</div>
	)
}