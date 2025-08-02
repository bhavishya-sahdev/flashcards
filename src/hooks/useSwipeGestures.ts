import { useEffect, useRef, useState } from 'react';

export interface SwipeGestureHandlers {
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
	onSwipeUp?: () => void;
	onSwipeDown?: () => void;
}

export interface SwipeOptions {
	threshold?: number; // Minimum distance for swipe
	velocity?: number; // Minimum velocity for swipe
	preventDefaultTouchmoveEvent?: boolean;
	touchEventOptions?: AddEventListenerOptions;
}

const DEFAULT_OPTIONS: Required<SwipeOptions> = {
	threshold: 50,
	velocity: 0.3,
	preventDefaultTouchmoveEvent: false,
	touchEventOptions: { passive: true }
};

export const useSwipeGestures = <T extends HTMLElement = HTMLDivElement>(
	handlers: SwipeGestureHandlers,
	options: SwipeOptions = {}
) => {
	const elementRef = useRef<T>(null);
	const [isSwiping, setIsSwiping] = useState(false);
	
	const config = { ...DEFAULT_OPTIONS, ...options };
	
	useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		let startX = 0;
		let startY = 0;
		let startTime = 0;
		let isTouching = false;

		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length !== 1) return;
			
			const touch = e.touches[0];
			startX = touch.clientX;
			startY = touch.clientY;
			startTime = Date.now();
			isTouching = true;
			setIsSwiping(false);
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (!isTouching || e.touches.length !== 1) return;
			
			if (config.preventDefaultTouchmoveEvent) {
				e.preventDefault();
			}
			
			setIsSwiping(true);
		};

		const handleTouchEnd = (e: TouchEvent) => {
			if (!isTouching) return;
			
			isTouching = false;
			setIsSwiping(false);
			
			if (e.changedTouches.length !== 1) return;
			
			const touch = e.changedTouches[0];
			const endX = touch.clientX;
			const endY = touch.clientY;
			const endTime = Date.now();
			
			const deltaX = endX - startX;
			const deltaY = endY - startY;
			const deltaTime = endTime - startTime;
			
			const absX = Math.abs(deltaX);
			const absY = Math.abs(deltaY);
			const velocity = Math.max(absX, absY) / deltaTime;
			
			// Check if swipe meets threshold and velocity requirements
			if (velocity < config.velocity) return;
			
			// Determine swipe direction - prioritize the axis with greater movement
			if (absX > absY && absX > config.threshold) {
				// Horizontal swipe
				if (deltaX > 0) {
					handlers.onSwipeRight?.();
				} else {
					handlers.onSwipeLeft?.();
				}
			} else if (absY > config.threshold) {
				// Vertical swipe
				if (deltaY > 0) {
					handlers.onSwipeDown?.();
				} else {
					handlers.onSwipeUp?.();
				}
			}
		};

		const handleTouchCancel = () => {
			isTouching = false;
			setIsSwiping(false);
		};

		// Add event listeners
		element.addEventListener('touchstart', handleTouchStart, config.touchEventOptions);
		element.addEventListener('touchmove', handleTouchMove, config.touchEventOptions);
		element.addEventListener('touchend', handleTouchEnd, config.touchEventOptions);
		element.addEventListener('touchcancel', handleTouchCancel, config.touchEventOptions);

		return () => {
			element.removeEventListener('touchstart', handleTouchStart);
			element.removeEventListener('touchmove', handleTouchMove);
			element.removeEventListener('touchend', handleTouchEnd);
			element.removeEventListener('touchcancel', handleTouchCancel);
		};
	}, [handlers, config]);

	return { elementRef, isSwiping };
};