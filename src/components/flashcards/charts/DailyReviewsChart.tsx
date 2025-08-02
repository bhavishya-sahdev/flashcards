'use client'

import React from 'react'

interface DailyReview {
	date: string;
	total: number;
	correct: number;
	accuracy: number;
}

interface DailyReviewsChartProps {
	data: DailyReview[];
	className?: string;
}

export function DailyReviewsChart({ data, className = '' }: DailyReviewsChartProps) {
	const maxReviews = Math.max(...data.map(d => d.total), 1);
	const maxHeight = 120;

	return (
		<div className={`bg-gray-900/50 border border-gray-800 p-6 ${className}`}>
			<h3 className="text-lg font-semibold text-white mb-4">Daily Reviews (Last 30 Days)</h3>
			
			<div className="space-y-4">
				{/* Chart */}
				<div className="relative h-32 flex items-end justify-between gap-1">
					{data.slice(-14).map((day, index) => { // Show last 14 days for better visibility
						const height = (day.total / maxReviews) * maxHeight;
						const correctHeight = (day.correct / maxReviews) * maxHeight;
						
						return (
							<div key={day.date} className="flex-1 flex flex-col items-center group relative">
								{/* Tooltip */}
								<div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-gray-800 text-white text-xs rounded px-2 py-1 min-w-max">
									<div>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
									<div>Total: {day.total}</div>
									<div>Correct: {day.correct}</div>
									<div>Accuracy: {day.accuracy.toFixed(1)}%</div>
								</div>
								
								{/* Bar */}
								<div 
									className="w-full bg-gray-700 relative rounded-t"
									style={{ height: `${Math.max(height, 2)}px` }}
								>
									{/* Correct portion */}
									<div 
										className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
										style={{ height: `${correctHeight}px` }}
									/>
									{/* Incorrect portion */}
									{day.total > day.correct && (
										<div 
											className="absolute top-0 w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t"
											style={{ height: `${height - correctHeight}px` }}
										/>
									)}
								</div>
								
								{/* Date label */}
								<div className="text-xs text-gray-400 mt-1 transform -rotate-45 origin-top-left">
									{new Date(day.date).getDate()}
								</div>
							</div>
						);
					})}
				</div>
				
				{/* Legend */}
				<div className="flex items-center justify-center gap-4 text-sm">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-emerald-500 rounded"></div>
						<span className="text-gray-300">Correct</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-red-500 rounded"></div>
						<span className="text-gray-300">Incorrect</span>
					</div>
				</div>
				
				{/* Summary */}
				<div className="text-center text-sm text-gray-400">
					Total reviews: {data.reduce((sum, d) => sum + d.total, 0)} | 
					Average accuracy: {(data.reduce((sum, d, _, arr) => sum + d.accuracy, 0) / data.length).toFixed(1)}%
				</div>
			</div>
		</div>
	);
}