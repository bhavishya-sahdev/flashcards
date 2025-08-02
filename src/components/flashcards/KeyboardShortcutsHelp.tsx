import React from 'react';
import { X, Keyboard, ArrowLeft, ArrowRight, Space, Hash } from 'lucide-react';
import { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
	isOpen: boolean;
	onClose: () => void;
	shortcuts: KeyboardShortcut[];
}

const getKeyIcon = (key: string) => {
	switch (key.toLowerCase()) {
		case 'arrowleft':
		case '←':
			return <ArrowLeft className="w-4 h-4" />;
		case 'arrowright':
		case '→':
			return <ArrowRight className="w-4 h-4" />;
		case 'space':
		case ' ':
			return <Space className="w-4 h-4" />;
		case 'enter':
			return <span className="text-xs font-mono">⏎</span>;
		case 'escape':
			return <span className="text-xs font-mono">Esc</span>;
		default:
			if (/^\d$/.test(key)) {
				return <Hash className="w-3 h-3" />;
			}
			return <span className="text-sm font-mono font-bold">{key}</span>;
	}
};

const formatKeyDisplay = (shortcut: KeyboardShortcut) => {
	const modifiers = [];
	if (shortcut.ctrlKey) modifiers.push('Ctrl');
	if (shortcut.altKey) modifiers.push('Alt');
	if (shortcut.shiftKey) modifiers.push('Shift');
	
	const keyDisplay = shortcut.key === ' ' ? 'Space' : shortcut.key;
	
	return modifiers.length > 0 
		? `${modifiers.join(' + ')} + ${keyDisplay}`
		: keyDisplay;
};

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
	isOpen,
	onClose,
	shortcuts,
}) => {
	if (!isOpen) return null;

	// Group shortcuts by category
	const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
		if (!acc[shortcut.category]) {
			acc[shortcut.category] = [];
		}
		acc[shortcut.category].push(shortcut);
		return acc;
	}, {} as Record<string, KeyboardShortcut[]>);

	return (
		<div
			className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div
				className="bg-gray-900 border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-800">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
							<Keyboard className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
							<p className="text-sm text-gray-400">Navigate faster with these shortcuts</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Shortcuts List */}
				<div className="p-6 space-y-6">
					{Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
						<div key={category}>
							<h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-gray-800">
								{category}
							</h3>
							<div className="space-y-2">
								{categoryShortcuts.map((shortcut, index) => (
									<div
										key={`${shortcut.key}-${index}`}
										className="flex items-center justify-between py-2 px-3 bg-gray-800/30 border border-gray-800/50 hover:bg-gray-800/50 transition-colors"
									>
										<span className="text-gray-300 text-sm">
											{shortcut.description}
										</span>
										<div className="flex items-center gap-2">
											<div className="flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs font-mono">
												{getKeyIcon(shortcut.key)}
												<span className="ml-1">
													{formatKeyDisplay(shortcut)}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Footer Tip */}
				<div className="p-6 border-t border-gray-800 bg-gray-800/20">
					<p className="text-xs text-gray-500 text-center">
						💡 Shortcuts are disabled when typing in input fields
					</p>
				</div>
			</div>
		</div>
	);
};