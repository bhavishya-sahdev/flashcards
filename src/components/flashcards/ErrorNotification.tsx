// components/flashcards/ErrorNotification.tsx
import { AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ErrorNotificationProps {
    message: string;
    onClose: () => void;
    autoClose?: boolean;
    duration?: number;
}

export const ErrorNotification = ({
    message,
    onClose,
    autoClose = true,
    duration = 5000,
}: ErrorNotificationProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md">
            <div className="bg-red-900/90 border border-red-700 backdrop-blur-sm p-4 shadow-lg animate-in slide-in-from-right-5">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-red-100 text-sm">{message}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};