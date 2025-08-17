'use client'

import React, { useState } from 'react'
import { Settings, User, Bell, Palette, Shield } from 'lucide-react'
import { BackgroundAnimation } from '@/components/flashcards/BackgroundAnimation'
import { GlobalStyles } from '@/components/flashcards/GlobalStyles'
import { NotificationSettings } from '@/components/notifications/NotificationSettings'
import { useSession } from '@/lib/auth-client'

export default function SettingsPage() {
	const { data } = useSession()
	const [activeTab, setActiveTab] = useState('profile')

	return (
		<div className="min-h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
			<GlobalStyles />
			<BackgroundAnimation />

			<div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
				<div className="mb-16">
					<div className="flex items-center gap-4 mb-6">
						<div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-2xl">
							<Settings className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
								Settings
							</h1>
							<div className="flex items-center gap-2 mt-1">
								<Shield className="w-4 h-4 text-cyan-400" />
								<span className="text-sm text-gray-400 font-medium">Customize your experience</span>
							</div>
						</div>
					</div>
				</div>

				{/* Navigation tabs */}
				<div className="flex space-x-1 mb-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-1 rounded-lg">
					{[
						{ id: 'profile', label: 'Profile', icon: User, color: 'text-blue-400' },
						{ id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-yellow-400' },
						{ id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-purple-400' },
						{ id: 'security', label: 'Security', icon: Shield, color: 'text-emerald-400' },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								activeTab === tab.id
									? 'bg-gray-800 text-white shadow-sm'
									: 'text-gray-400 hover:text-white hover:bg-gray-800/50'
							}`}
						>
							<tab.icon className={`w-4 h-4 ${tab.color}`} />
							{tab.label}
						</button>
					))}
				</div>

				{/* Tab content */}
				<div className="border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6 rounded-lg">
					{activeTab === 'profile' && (
						<div>
							<div className="flex items-center gap-3 mb-4">
								<User className="w-8 h-8 text-blue-400" />
								<h3 className="text-xl font-semibold">Profile Settings</h3>
							</div>
							<p className="text-gray-400">Coming soon! Manage your profile information and account preferences.</p>
						</div>
					)}

					{activeTab === 'notifications' && (
						<div>
							<NotificationSettings />
						</div>
					)}

					{activeTab === 'appearance' && (
						<div>
							<div className="flex items-center gap-3 mb-4">
								<Palette className="w-8 h-8 text-purple-400" />
								<h3 className="text-xl font-semibold">Appearance</h3>
							</div>
							<p className="text-gray-400">Coming soon! Choose your preferred theme and customize the app appearance.</p>
						</div>
					)}

					{activeTab === 'security' && (
						<div>
							<div className="flex items-center gap-3 mb-4">
								<Shield className="w-8 h-8 text-emerald-400" />
								<h3 className="text-xl font-semibold">Privacy & Security</h3>
							</div>
							<p className="text-gray-400">Coming soon! Manage your privacy settings and security preferences.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}