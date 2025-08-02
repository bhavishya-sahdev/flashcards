'use client'

import React from 'react'
import { Settings, User, Bell, Palette, Shield } from 'lucide-react'
import { BackgroundAnimation } from '@/components/flashcards/BackgroundAnimation'
import { GlobalStyles } from '@/components/flashcards/GlobalStyles'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Navbar from '@/components/Navbar'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { SignUpDialog } from '@/components/auth/sign-up-dialog'
import { useSession } from '@/lib/auth-client'

export default function SettingsPage() {
	const { data } = useSession()

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

				<div className="grid md:grid-cols-2 gap-6">
					<div className="border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6">
						<div className="flex items-center gap-3 mb-4">
							<User className="w-8 h-8 text-blue-400" />
							<h3 className="text-xl font-semibold">Profile Settings</h3>
						</div>
						<p className="text-gray-400">Coming soon! Manage your profile information and account preferences.</p>
					</div>

					<div className="border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6">
						<div className="flex items-center gap-3 mb-4">
							<Bell className="w-8 h-8 text-yellow-400" />
							<h3 className="text-xl font-semibold">Notifications</h3>
						</div>
						<p className="text-gray-400">Coming soon! Configure your study reminders and notification preferences.</p>
					</div>

					<div className="border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6">
						<div className="flex items-center gap-3 mb-4">
							<Palette className="w-8 h-8 text-purple-400" />
							<h3 className="text-xl font-semibold">Appearance</h3>
						</div>
						<p className="text-gray-400">Coming soon! Choose your preferred theme and customize the app appearance.</p>
					</div>

					<div className="border border-gray-800 bg-gray-900/30 backdrop-blur-sm p-6">
						<div className="flex items-center gap-3 mb-4">
							<Shield className="w-8 h-8 text-emerald-400" />
							<h3 className="text-xl font-semibold">Privacy & Security</h3>
						</div>
						<p className="text-gray-400">Coming soon! Manage your privacy settings and security preferences.</p>
					</div>
				</div>
			</div>
		</div>
	)
}