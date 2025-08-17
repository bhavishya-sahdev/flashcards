'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { QuizGenerator } from './QuizGenerator';

// Import the quiz type
interface MixedQuiz {
  id: string;
  title: string;
  description: string;
  folderId: string;
  folderName: string;
  questionCount: number;
  questions: any[];
  createdAt: string;
}

interface QuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  folderName: string;
  onStartQuiz: (quiz: MixedQuiz) => void;
  mounted?: boolean;
}

export const QuizGeneratorModal: React.FC<QuizGeneratorModalProps> = ({
  isOpen,
  onClose,
  folderId,
  folderName,
  onStartQuiz,
  mounted = true,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-y-auto border-gray-800"
        showCloseButton={true}
      >
        <QuizGenerator
          folderId={folderId}
          folderName={folderName}
          onClose={onClose}
          onStartQuiz={onStartQuiz}
          mounted={mounted}
        />
      </DialogContent>
    </Dialog>
  );
};