'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  User, 
  LogOut, 
  Settings, 
  UserCircle, 
  Menu,
  Terminal,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useSession, signOut } from '@/lib/auth-client'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { SignUpDialog } from '@/components/auth/sign-up-dialog'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

interface TopBarProps {
  showSidebarToggle?: boolean
  onSidebarToggle?: () => void
  title?: string
  showSearch?: boolean
  className?: string
}

export function TopBar({ 
  showSidebarToggle = false, 
  onSidebarToggle,
  title,
  showSearch = false,
  className = ""
}: TopBarProps) {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const user = session?.user

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container flex h-14 items-center">
        {/* Left section */}
        <div className="flex items-center gap-4 pl-4">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {!showSidebarToggle && (
            <Link href="/" className="flex items-center space-x-2">
              <Terminal className="h-6 w-6" />
              <span className="font-bold text-lg">Flashcards</span>
            </Link>
          )}

          {title && (
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
          )}
        </div>

        {/* Center section - Search */}
        {showSearch && (
          <div className="flex-1 max-w-sm mx-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search flashcards..."
                className="w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          {user && <NotificationCenter />}

          {/* Auth Section */}
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="flex items-center gap-2">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <UserCircle className="h-8 w-8" />
                    )}
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {user.name || user.email}
                      </span>
                      {user.name && (
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <SignInDialog triggerLabel="Sign In" />
                <SignUpDialog triggerLabel="Sign Up" />
              </div>

              {/* Mobile Auth Menu */}
              <div className="md:hidden">
                <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <div className="flex flex-col gap-4 mt-8">
                      <SignInDialog triggerLabel="Sign In" />
                      <SignUpDialog triggerLabel="Sign Up" />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}