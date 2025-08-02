import React from 'react';
import { ReviewQuality } from '@/lib/types';
import { X, AlertTriangle, Minus, Check, CheckCircle, Star, Clock } from 'lucide-react';

interface ReviewButtonsProps {
	onReview: (quality: ReviewQuality, responseTime?: number) => void;
	disabled?: boolean;
	startTime?: Date;
	mounted?: boolean;
}

const reviewOptions = [
	{
		quality: 0 as ReviewQuality,
		label: 'Again',
		description: 'Complete blackout',
		bgColor: 'bg-red-500/10 hover:bg-red-500/20',
		borderColor: 'border-red-500/30 hover:border-red-500/50',
		textColor: 'text-red-400',
		iconColor: 'text-red-500',
		icon: X,
		shortcut: '1',
	},
	{
		quality: 1 as ReviewQuality,
		label: 'Hard',
		description: 'Incorrect response',
		bgColor: 'bg-gray-800/50 hover:bg-gray-700/50',
		borderColor: 'border-gray-700 hover:border-gray-600',
		textColor: 'text-gray-300',
		iconColor: 'text-gray-400',
		icon: AlertTriangle,
		shortcut: '2',
	},
	{
		quality: 2 as ReviewQuality,
		label: 'Good',
		description: 'Incorrect but recalled easily',
		bgColor: 'bg-gray-800/50 hover:bg-gray-700/50',
		borderColor: 'border-gray-700 hover:border-gray-600',
		textColor: 'text-gray-300',
		iconColor: 'text-gray-400',
		icon: Minus,
		shortcut: '3',
	},
	{
		quality: 3 as ReviewQuality,
		label: 'Good',
		description: 'Correct with hesitation',
		bgColor: 'bg-gray-800/50 hover:bg-gray-700/50',
		borderColor: 'border-gray-700 hover:border-gray-600',
		textColor: 'text-gray-300',
		iconColor: 'text-gray-400',
		icon: Check,
		shortcut: '4',
	},
	{
		quality: 4 as ReviewQuality,
		label: 'Easy',
		description: 'Correct response',
		bgColor: 'bg-gray-800/50 hover:bg-gray-700/50',
		borderColor: 'border-gray-700 hover:border-gray-600',
		textColor: 'text-gray-300',
		iconColor: 'text-gray-400',
		icon: CheckCircle,
		shortcut: '5',
	},
	{
		quality: 5 as ReviewQuality,
		label: 'Perfect',
		description: 'Perfect response',
		bgColor: 'bg-green-500/10 hover:bg-green-500/20',
		borderColor: 'border-green-500/30 hover:border-green-500/50',
		textColor: 'text-green-400',
		iconColor: 'text-green-500',
		icon: Star,
		shortcut: '6',
	},
];

export const ReviewButtons: React.FC<ReviewButtonsProps> = ({
	onReview,
	disabled = false,
	startTime,
	mounted = true,
}) => {
	const handleReview = (quality: ReviewQuality) => {
		if (disabled) return;

		const responseTime = startTime
			? Math.round((Date.now() - startTime.getTime()) / 1000)
			: undefined;

		onReview(quality, responseTime);
	};

	// Keyboard shortcuts
	React.useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (disabled) return;

			const key = event.key;
			const option = reviewOptions.find(opt => opt.shortcut === key);
			
			if (option) {
				event.preventDefault();
				handleReview(option.quality);
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [disabled]);

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<div className="text-center">
				<h3 className="text-lg font-semibold text-white mb-2">
					How well did you recall this card?
				</h3>
				<p className="text-gray-400 text-sm">
					Use buttons below or keyboard shortcuts (1-6)
				</p>
			</div>

			{/* Review Buttons - Mobile optimized */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
				{reviewOptions.map((option, index) => {
					const Icon = option.icon;
					
					return (
						<button
							key={option.quality}
							onClick={() => handleReview(option.quality)}
							disabled={disabled}
							className={`
								relative group p-4 sm:p-5 rounded-lg border transition-all duration-200
								${option.bgColor} ${option.borderColor}
								active:scale-95 sm:hover:scale-[1.02] sm:active:scale-[0.98]
								disabled:opacity-50 disabled:cursor-not-allowed
								disabled:active:scale-100 disabled:hover:scale-100
								${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
								min-h-[72px] sm:min-h-[80px] touch-manipulation
							`}
							style={{
								transition: 'all 0.2s ease-out',
								transitionDelay: `${index * 25}ms`,
							}}
						>
							{/* Shortcut badge - hidden on mobile */}
							<div className={`
								absolute top-3 right-3 w-5 h-5 bg-gray-900/80 
								flex items-center justify-center text-xs font-mono
								rounded border border-gray-700 ${option.textColor}
								hidden sm:flex
							`}>
								{option.shortcut}
							</div>

							{/* Content - Mobile optimized layout */}
							<div className="flex items-center gap-3 sm:gap-4">
								<div className={`
									w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-900/50 border border-gray-700
									flex items-center justify-center flex-shrink-0
									group-hover:bg-gray-900/70 transition-colors
								`}>
									<Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${option.iconColor}`} />
								</div>
								
								<div className="flex-1 text-left min-w-0">
									<div className={`font-semibold text-base sm:text-lg ${option.textColor} mb-1`}>
										{option.label}
									</div>
									<div className={`text-sm sm:text-xs ${option.textColor} opacity-75 leading-tight`}>
										{option.description}
									</div>
									{/* Mobile shortcut indicator */}
									<div className={`sm:hidden text-xs ${option.textColor} opacity-60 mt-1 font-mono`}>
										Tap or press {option.shortcut}
									</div>
								</div>
							</div>
						</button>
					);
				})}
			</div>

			{/* Response time indicator */}
			{startTime && (
				<div className="text-center">
					<div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300">
						<Clock className="w-4 h-4" />
						<span>Response time: {Math.round((Date.now() - startTime.getTime()) / 1000)}s</span>
					</div>
				</div>
			)}

			{/* Tips */}
			<div className="text-center">
				<p className="text-xs text-gray-500">
					💡 Be honest with your ratings for optimal learning
				</p>
			</div>
		</div>
	);
};