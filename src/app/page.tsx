'use client'

import { useFolders } from '@/hooks/useFolders';
import { SignInDialog } from '@/components/auth/sign-in-dialog';
import { SignUpDialog } from '@/components/auth/sign-up-dialog';
import { BackgroundAnimation } from '@/components/flashcards/BackgroundAnimation';
import { GlobalStyles } from '@/components/flashcards/GlobalStyles';
import { ErrorNotification } from '@/components/flashcards/ErrorNotification';
import Navbar from '@/components/Navbar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSession } from '@/lib/auth-client';
import { QuickStats } from '@/components/flashcards/dashboard/QuickStats';
import { QuickActions } from '@/components/flashcards/dashboard/QuickActions';
import { RecentActivity } from '@/components/flashcards/dashboard/RecentActivity';
import { FolderCard } from '@/components/flashcards/dashboard/FolderCard';
import { DashboardCard } from '@/components/flashcards/dashboard/DashboardCard';
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, FolderOpen, Plus, Save, X, Brain, LayoutDashboard } from 'lucide-react';

const Homepage = () => {
    const { data } = useSession();
    const {
        folders,
        loading,
        error,
        createFolder,
        editFolder,
        deleteFolder,
        initializeDefaultFolders,
    } = useFolders();

    const [showInitializePrompt, setShowInitializePrompt] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderDescription, setNewFolderDescription] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show initialize prompt for users with no folders (both authenticated and unauthenticated)
    useEffect(() => {
        if (!loading && folders.length === 0 && !error) {
            setShowInitializePrompt(true);
        } else {
            setShowInitializePrompt(false);
        }
    }, [loading, folders.length, error]);

    const handleCreateFolder = async (name: string, description: string) => {
        try {
            await createFolder(name, description);
            setNewFolderName('');
            setNewFolderDescription('');
            setShowCreateForm(false);
        } catch (error) {
            setErrorMessage('Failed to create folder. Please try again.');
        }
    };

    const handleEditFolder = async (folderId: string, name: string, description: string) => {
        try {
            await editFolder(folderId, name, description);
            setEditingFolderId(null);
            setNewFolderName('');
            setNewFolderDescription('');
        } catch (error) {
            setErrorMessage('Failed to update folder. Please try again.');
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        try {
            await deleteFolder(folderId);
        } catch (error) {
            setErrorMessage('Failed to delete folder. Please try again.');
        }
    };

    const handleInitializeDefaultFolders = async () => {
        try {
            await initializeDefaultFolders();
            setShowInitializePrompt(false);
        } catch (error) {
            setErrorMessage('Failed to initialize folders. Please try again.');
        }
    };

    const startEditing = (folder: any) => {
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

    const staggerDelay = (index: number) => ({
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        opacity: mounted ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${index * 100}ms`
    });

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                    <p className="text-gray-400">Loading your flashcards...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Initialize prompt for new users
    if (showInitializePrompt) {
        return (
            <div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                <GlobalStyles />
                <BackgroundAnimation />
                <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger className="text-white hover:text-gray-300" />
                    <Navbar items={[{ label: 'Blog', href: "/blog" }]} itemsRight={[<div className='flex gap-2 items-center' key="auth">
                        {data ? (
                            <span className='text-sm font-medium text-gray-300'>Hey, {data.user.name.split(" ")[0]}!</span>
                        ) : (
                            <>
                                <SignInDialog triggerLabel='Sign in' />
                                <SignUpDialog triggerLabel='Sign up' />
                            </>
                        )}
                    </div>]} />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-4">Welcome to Flashcards!</h1>
                        <p className="text-gray-400 text-lg">
                            {data ? (
                                "Would you like to start with some example flashcards?"
                            ) : (
                                "Start learning with flashcards! You can study without an account, or sign up to sync across devices."
                            )}
                        </p>
                    </div>

                    <div className="border border-gray-800 p-8 bg-gray-900/30 backdrop-blur-sm mb-8">
                        <h3 className="text-xl font-semibold mb-4">Get Started</h3>
                        <p className="text-gray-400 mb-6">
                            We can create some sample folders with Data Structures & Algorithms flashcards to help you get started,
                            or you can start with a blank slate.
                            {!data && (
                                <span className="block mt-2 text-sm text-amber-400">
                                    Note: Without an account, your progress will be saved locally on this device only.
                                </span>
                            )}
                        </p>

                        <div className="flex gap-4 justify-center flex-wrap">
                            <button
                                onClick={handleInitializeDefaultFolders}
                                className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                            >
                                Start with Examples
                            </button>
                            <button
                                onClick={() => setShowInitializePrompt(false)}
                                className="px-6 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                            >
                                Start Fresh
                            </button>
                        </div>

                        {!data && (
                            <div className="mt-6 pt-6 border-t border-gray-800">
                                <p className="text-sm text-gray-500 mb-4">Want to sync your flashcards across devices?</p>
                                <div className="flex gap-3 justify-center">
                                    <SignInDialog triggerLabel="Sign In" />
                                    <SignUpDialog triggerLabel="Create Account" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <GlobalStyles />
            <BackgroundAnimation />
            <div className="flex items-center gap-2 mb-4">
                <SidebarTrigger className="text-white hover:text-gray-300 mx-4" />
                <Navbar items={[{ label: 'Blog', href: "/blog" }]} itemsRight={[<div className='flex gap-2 items-center' key="auth">
                    {data ? (
                        <span className='text-sm font-medium text-gray-300'>Hey, {data.user.name.split(" ")[0]}!</span>
                    ) : (
                        <>
                            <SignInDialog triggerLabel='Sign in' />
                            <SignUpDialog triggerLabel='Sign up' />
                        </>
                    )}
                </div>]} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Dashboard Header */}
                <div className="mb-8" style={staggerDelay(0)}>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Brain className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-gray-400 font-medium">Your learning command center</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid gap-6">
                    {/* Top Row - Stats and Actions */}
                    <div className="grid lg:grid-cols-3 gap-6" style={staggerDelay(1)}>
                        <div className="lg:col-span-2">
                            <QuickStats />
                        </div>
                        <div>
                            <QuickActions />
                        </div>
                    </div>

                    {/* Middle Row - Folders and Activity */}
                    <div className="grid lg:grid-cols-3 gap-6" style={staggerDelay(2)}>
                        <div className="lg:col-span-2">
                            <DashboardCard
                                title="Study Folders"
                                icon={FolderOpen}
                                iconColor="text-blue-400"
                                headerActions={
                                    <div className="text-sm text-gray-400">
                                        {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
                                    </div>
                                }
                            >
                                {folders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No folders yet</h3>
                                        <p className="text-gray-500 mb-6">Create your first folder to start organizing your flashcards</p>
                                        <button
                                            onClick={() => setShowCreateForm(true)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create First Folder
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {folders.map((folder, index) => (
                                            <FolderCard
                                                key={folder.id}
                                                folder={folder}
                                                onEdit={() => startEditing(folder)}
                                                onDelete={() => handleDeleteFolder(folder.id)}
                                                className="transform transition-all duration-200"
                                            />
                                        ))}
                                    </div>
                                )}
                            </DashboardCard>
                        </div>
                        <div>
                            <RecentActivity />
                        </div>
                    </div>
                </div>

                {/* Create Folder Form Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 border border-gray-800 max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white">Create New Folder</h3>
                                <button
                                    onClick={cancelEditing}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Folder Name</label>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter folder name..."
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={newFolderDescription}
                                        onChange={(e) => setNewFolderDescription(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none h-20 resize-none"
                                        placeholder="Enter folder description..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => handleCreateFolder(newFolderName, newFolderDescription)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                    >
                                        <Save className="w-4 h-4" />
                                        Create Folder
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="px-4 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Folder Form Modal */}
                {editingFolderId && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 border border-gray-800 max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white">Edit Folder</h3>
                                <button
                                    onClick={cancelEditing}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Folder Name</label>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter folder name..."
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={newFolderDescription}
                                        onChange={(e) => setNewFolderDescription(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none h-20 resize-none"
                                        placeholder="Enter folder description..."
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => handleEditFolder(editingFolderId, newFolderName, newFolderDescription)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="px-4 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <ErrorNotification
                        message={errorMessage}
                        onClose={() => setErrorMessage('')}
                    />
                )}
            </div>
        </div>
    );
};

export default Homepage;