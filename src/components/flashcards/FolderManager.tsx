import { FlashcardFolder } from "@/lib/types";
import { Edit2, Folder, FolderOpen, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

interface FolderManagerProps {
    folders: FlashcardFolder[];
    currentFolderId: string;
    onFolderSelect: (folderId: string) => void;
    onCreateFolder: (name: string, description: string) => void;
    onEditFolder: (folderId: string, name: string, description: string) => void;
    onDeleteFolder: (folderId: string) => void;
    mounted: boolean;
}

export const FolderManager = ({
    folders,
    currentFolderId,
    onFolderSelect,
    onCreateFolder,
    onEditFolder,
    onDeleteFolder,
    mounted
}: FolderManagerProps) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderDescription, setNewFolderDescription] = useState('');

    const staggerDelay = (index: number) => ({
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        opacity: mounted ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${index * 100}ms`
    });

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName.trim(), newFolderDescription.trim());
            setNewFolderName('');
            setNewFolderDescription('');
            setShowCreateForm(false);
        }
    };

    const handleEditFolder = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId);
        if (folder && newFolderName.trim()) {
            onEditFolder(folderId, newFolderName.trim(), newFolderDescription.trim());
            setEditingFolderId(null);
            setNewFolderName('');
            setNewFolderDescription('');
        }
    };

    const startEditing = (folder: FlashcardFolder) => {
        setEditingFolderId(folder.id);
        setNewFolderName(folder.name);
        setNewFolderDescription(folder.description);
    };

    const cancelEditing = () => {
        setEditingFolderId(null);
        setNewFolderName('');
        setNewFolderDescription('');
        setShowCreateForm(false);
    };

    return (
        <div className="mb-16 border border-gray-800 bg-gray-900/30 backdrop-blur-sm" style={staggerDelay(2)}>
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Study Folders</h2>
                            <div className="text-sm text-gray-400">Organize your flashcards by topic</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-100 transition-all duration-200 text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Folder
                    </button>
                </div>

                {showCreateForm && (
                    <div className="mb-6 p-4 border border-gray-700 bg-gray-800/50">
                        <h3 className="text-lg font-semibold text-white mb-4">Create New Folder</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Folder Name</label>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white focus:border-gray-600 focus:outline-none"
                                    placeholder="Enter folder name..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={newFolderDescription}
                                    onChange={(e) => setNewFolderDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white focus:border-gray-600 focus:outline-none h-20 resize-none"
                                    placeholder="Enter folder description..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCreateFolder}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                    <Save className="w-4 h-4" />
                                    Create Folder
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folders.map((folder) => (
                        <div
                            key={folder.id}
                            className={`p-4 border cursor-pointer transition-all duration-200 hover:border-gray-600 ${currentFolderId === folder.id
                                ? 'border-blue-500 bg-blue-900/20'
                                : 'border-gray-700 bg-gray-800/30'
                                }`}
                            onClick={() => onFolderSelect(folder.id)}
                        >
                            {editingFolderId === folder.id ? (
                                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="w-full px-2 py-1 bg-gray-900 border border-gray-700 text-white text-sm focus:border-gray-600 focus:outline-none"
                                    />
                                    <textarea
                                        value={newFolderDescription}
                                        onChange={(e) => setNewFolderDescription(e.target.value)}
                                        className="w-full px-2 py-1 bg-gray-900 border border-gray-700 text-white text-xs focus:border-gray-600 focus:outline-none h-16 resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditFolder(folder.id)}
                                            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white hover:bg-green-700 transition-colors text-xs"
                                        >
                                            <Save className="w-3 h-3" />
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="flex items-center gap-1 px-2 py-1 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-xs"
                                        >
                                            <X className="w-3 h-3" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Folder className="w-5 h-5 text-blue-400" />
                                            <div className="flex gap-2 items-center">
                                                <h3 className="font-semibold text-white">{folder.name}</h3>
                                                <div className="flex items-center gap-1">
                                                    {currentFolderId === folder.id && (
                                                        <div className="w-2 h-2 bg-blue-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => startEditing(folder)}
                                                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            {folders.length > 1 && (
                                                <button
                                                    onClick={() => onDeleteFolder(folder.id)}
                                                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{folder.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{folder.flashcards.length} flashcards</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};