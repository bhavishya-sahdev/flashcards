import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
	key: string;
	ctrlKey?: boolean;
	altKey?: boolean;
	shiftKey?: boolean;
	description: string;
	category: string;
}

export interface UseKeyboardShortcutsOptions {
	shortcuts: {
		[key: string]: {
			handler: () => void;
			description: string;
			category: string;
			ctrlKey?: boolean;
			altKey?: boolean;
			shiftKey?: boolean;
		};
	};
	enabled?: boolean;
	preventDefault?: boolean;
}

export const useKeyboardShortcuts = ({
	shortcuts,
	enabled = true,
	preventDefault = true,
}: UseKeyboardShortcutsOptions) => {
	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (!enabled) return;

			// Don't handle shortcuts when user is typing in an input/textarea
			const activeElement = document.activeElement;
			if (
				activeElement &&
				(activeElement.tagName === 'INPUT' ||
					activeElement.tagName === 'TEXTAREA' ||
					activeElement.getAttribute('contenteditable') === 'true')
			) {
				return;
			}

			const key = event.key.toLowerCase();
			const shortcut = shortcuts[key];

			if (shortcut) {
				// Check modifier keys
				const ctrlMatch = (shortcut.ctrlKey ?? false) === event.ctrlKey;
				const altMatch = (shortcut.altKey ?? false) === event.altKey;
				const shiftMatch = (shortcut.shiftKey ?? false) === event.shiftKey;

				if (ctrlMatch && altMatch && shiftMatch) {
					if (preventDefault) {
						event.preventDefault();
					}
					shortcut.handler();
				}
			}
		},
		[shortcuts, enabled, preventDefault]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [handleKeyPress]);

	// Return shortcut list for help display
	const shortcutList: KeyboardShortcut[] = Object.entries(shortcuts).map(
		([key, config]) => ({
			key: key.toUpperCase(),
			description: config.description,
			category: config.category,
			ctrlKey: config.ctrlKey,
			altKey: config.altKey,
			shiftKey: config.shiftKey,
		})
	);

	return { shortcuts: shortcutList };
};