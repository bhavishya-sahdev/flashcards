'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, FolderOpen, BookOpen, Clock, Brain, CheckCircle, Plus, Settings } from 'lucide-react'
import { FlashcardFolder } from '@/lib/types'

interface FolderDashboardHeaderProps {
	folder: FlashcardFolder
	onAddCard: () => void
	className?: string
}

export function FolderDashboardHeader({ folder, onAddCard, className = '' }: FolderDashboardHeaderProps) {
	const totalCards = folder.flashcards.length
	const cardsDue = folder.flashcards.filter(card =>
		new Date(card.nextReviewDate) <= new Date()
	).length
	const cardsLearning = folder.flashcards.filter(card => card.isLearning).length
	const cardsGraduated = folder.flashcards.filter(card => !card.isLearning && card.repetitions > 0).length

	return (
		<div className={`bg-gray-900/50 border border-gray-800 backdrop-blur-sm ${className}`}>
			<div className="p-6">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 mb-6">
					<Link
						href="/"
						className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>Dashboard</span>
					</Link>
					<span className="text-gray-600">/</span>
					<span className="text-white text-sm font-medium">{folder.name}</span>
				</div>

				{/* Header */}
				<div className="flex items-start justify-between mb-8">
					<div className="flex items-center gap-4 flex-1 min-w-0">
						<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl flex-shrink-0">
							<FolderOpen className="w-8 h-8 text-white" />
						</div>
						<div className="flex-1 min-w-0">
							<h1 className="text-3xl font-bold text-white truncate mb-2">{folder.name}</h1>
							<p className="text-gray-400 text-lg leading-relaxed">{folder.description}</p>
						</div>
					</div>

					<div className="flex items-center gap-3 flex-shrink-0">
						<button
							onClick={onAddCard}
							className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
						>
							<Plus className="w-4 h-4" />
							<span className="hidden sm:inline">Add Card</span>
						</button>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="bg-gray-800/30 border border-gray-700/50 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<BookOpen className="w-4 h-4 text-blue-400" />
							<span className="text-sm text-gray-400 font-medium">Total</span>
						</div>
						<div className="text-2xl font-bold text-white">{totalCards}</div>
						<div className="text-xs text-gray-500 mt-1">flashcards</div>
					</div>

					<div className="bg-gray-800/30 border border-gray-700/50 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Clock className="w-4 h-4 text-yellow-400" />
							<span className="text-sm text-gray-400 font-medium">Due</span>
						</div>
						<div className="text-2xl font-bold text-white">{cardsDue}</div>
						<div className="text-xs text-gray-500 mt-1">to review</div>
					</div>

					<div className="bg-gray-800/30 border border-gray-700/50 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Brain className="w-4 h-4 text-purple-400" />
							<span className="text-sm text-gray-400 font-medium">Learning</span>
						</div>
						<div className="text-2xl font-bold text-white">{cardsLearning}</div>
						<div className="text-xs text-gray-500 mt-1">in progress</div>
					</div>

					<div className="bg-gray-800/30 border border-gray-700/50 p-4 text-center">
						<div className="flex items-center justify-center gap-2 mb-2">
							<CheckCircle className="w-4 h-4 text-emerald-400" />
							<span className="text-sm text-gray-400 font-medium">Mastered</span>
						</div>
						<div className="text-2xl font-bold text-white">{cardsGraduated}</div>
						<div className="text-xs text-gray-500 mt-1">completed</div>
					</div>
				</div>

				{/* Progress Bar */}
				{totalCards > 0 && (
					<div className="mt-6">
						<div className="flex items-center justify-between text-sm mb-2">
							<span className="text-gray-400">Overall Progress</span>
							<span className="text-gray-300">
								{Math.round(((totalCards - cardsLearning) / totalCards) * 100)}% complete
							</span>
						</div>
						<div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-700 rounded-full"
								style={{
									width: `${((totalCards - cardsLearning) / totalCards) * 100}%`
								}}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}