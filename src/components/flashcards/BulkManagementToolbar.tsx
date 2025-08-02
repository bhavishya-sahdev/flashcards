import React, { useState } from 'react';
import { Flashcard } from '@/lib/types';
import { 
  Trash2, 
  Copy, 
  Move, 
  Edit3, 
  Download, 
  Upload, 
  X, 
  CheckSquare, 
  Square,
  Archive,
  MoreHorizontal
} from 'lucide-react';

interface BulkManagementToolbarProps {
  selectedCards: Set<string>;
  totalCards: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onBulkDelete: () => void;
  onBulkDuplicate: () => void;
  onBulkMove: (targetFolderId: string) => void;
  onBulkEdit: (updates: Partial<Flashcard>) => void;
  onExport: () => void;
  onClose: () => void;
  folders: Array<{ id: string; name: string; }>;
  currentFolderId: string;
}

export const BulkManagementToolbar: React.FC<BulkManagementToolbarProps> = ({
  selectedCards,
  totalCards,
  onSelectAll,
  onSelectNone,
  onBulkDelete,
  onBulkDuplicate,
  onBulkMove,
  onBulkEdit,
  onExport,
  onClose,
  folders,
  currentFolderId
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const selectedCount = selectedCards.size;
  const allSelected = selectedCount === totalCards && totalCards > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCards;

  const handleSelectToggle = () => {
    if (allSelected) {
      onSelectNone();
    } else {
      onSelectAll();
    }
  };

  const availableFolders = folders.filter(folder => folder.id !== currentFolderId);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl backdrop-blur-sm">
        {/* Main Toolbar */}
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectToggle}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-400" />
              ) : someSelected ? (
                <div className="w-5 h-5 border-2 border-blue-400 bg-blue-400/30 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-sm" />
                </div>
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {selectedCount} / {totalCards} selected
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
              {/* Delete */}
              <button
                onClick={onBulkDelete}
                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors rounded-lg"
                title="Delete selected cards"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Delete</span>
              </button>

              {/* Duplicate */}
              <button
                onClick={onBulkDuplicate}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors rounded-lg"
                title="Duplicate selected cards"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Duplicate</span>
              </button>

              {/* Move - Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoveMenu(!showMoveMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors rounded-lg"
                  title="Move to folder"
                >
                  <Move className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Move</span>
                </button>
                
                {showMoveMenu && availableFolders.length > 0 && (
                  <div className="absolute bottom-full mb-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-48">
                    <div className="p-2">
                      <div className="text-xs text-gray-400 px-2 py-1">Move to folder:</div>
                      {availableFolders.map(folder => (
                        <button
                          key={folder.id}
                          onClick={() => {
                            onBulkMove(folder.id);
                            setShowMoveMenu(false);
                          }}
                          className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        >
                          {folder.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Edit - Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowEditMenu(!showEditMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors rounded-lg"
                  title="Edit selected cards"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Edit</span>
                </button>
                
                {showEditMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-48">
                    <div className="p-2">
                      <div className="text-xs text-gray-400 px-2 py-1">Bulk edit:</div>
                      
                      {/* Difficulty options */}
                      <div className="px-2 py-2">
                        <div className="text-xs text-gray-500 mb-1">Set difficulty:</div>
                        <div className="flex gap-1">
                          {(['Easy', 'Medium', 'Hard'] as const).map(difficulty => (
                            <button
                              key={difficulty}
                              onClick={() => {
                                onBulkEdit({ difficulty });
                                setShowEditMenu(false);
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                difficulty === 'Easy' 
                                  ? 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900' 
                                  : difficulty === 'Medium'
                                  ? 'bg-amber-900/50 text-amber-400 hover:bg-amber-900'
                                  : 'bg-red-900/50 text-red-400 hover:bg-red-900'
                              }`}
                            >
                              {difficulty}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Export */}
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors rounded-lg"
                title="Export selected cards"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Export</span>
              </button>
            </div>
          )}

          {/* Close */}
          <div className="border-l border-gray-700 pl-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg"
              title="Exit bulk mode"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};