import React from 'react';
import { AlertTriangle, Trash2, Copy, Move, X } from 'lucide-react';

interface BulkConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  operation: 'delete' | 'duplicate' | 'move' | 'edit';
  selectedCount: number;
  targetFolderName?: string;
  editField?: string;
  editValue?: string;
}

export const BulkConfirmDialog: React.FC<BulkConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  operation,
  selectedCount,
  targetFolderName,
  editField,
  editValue
}) => {
  if (!isOpen) return null;

  const getOperationDetails = () => {
    switch (operation) {
      case 'delete':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-400" />,
          title: 'Delete Flashcards',
          message: `Are you sure you want to delete ${selectedCount} flashcard${selectedCount === 1 ? '' : 's'}?`,
          warning: 'This action cannot be undone. All study progress for these cards will be lost.',
          confirmText: 'Delete',
          confirmClass: 'bg-red-600 hover:bg-red-700 text-white'
        };
      
      case 'duplicate':
        return {
          icon: <Copy className="w-6 h-6 text-blue-400" />,
          title: 'Duplicate Flashcards',
          message: `Create copies of ${selectedCount} flashcard${selectedCount === 1 ? '' : 's'}?`,
          warning: 'Duplicated cards will be created in the same folder with "(Copy)" added to their questions.',
          confirmText: 'Duplicate',
          confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      
      case 'move':
        return {
          icon: <Move className="w-6 h-6 text-emerald-400" />,
          title: 'Move Flashcards',
          message: `Move ${selectedCount} flashcard${selectedCount === 1 ? '' : 's'} to "${targetFolderName}"?`,
          warning: 'Study progress will be preserved when moving cards between folders.',
          confirmText: 'Move',
          confirmClass: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        };
      
      case 'edit':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          title: 'Edit Flashcards',
          message: `Update ${editField} to "${editValue}" for ${selectedCount} flashcard${selectedCount === 1 ? '' : 's'}?`,
          warning: 'This will overwrite the current values for all selected cards.',
          confirmText: 'Update',
          confirmClass: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-gray-400" />,
          title: 'Confirm Action',
          message: `Proceed with this action on ${selectedCount} flashcard${selectedCount === 1 ? '' : 's'}?`,
          warning: '',
          confirmText: 'Confirm',
          confirmClass: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
    }
  };

  const details = getOperationDetails();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {details.icon}
            <h3 className="text-lg font-semibold text-white">{details.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-4 leading-relaxed">
            {details.message}
          </p>
          {details.warning && (
            <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 mb-4">
              <p className="text-amber-200 text-sm leading-relaxed">
                {details.warning}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${details.confirmClass}`}
          >
            {details.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};