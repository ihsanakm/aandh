"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/theme-toggle'
import {
    Calendar,
    DollarSign,
    XCircle,
    Users,
    Download,
    TrendingUp,
    Utensils,
    Menu,
    X,
    Home,
    LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { href: '/admin/pricing', label: 'Pricing', icon: DollarSign },
    { href: '/admin/closures', label: 'Closures', icon: XCircle },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/reports', label: 'Reports', icon: Download },
    { href: '/admin/available-slots', label: 'Availability', icon: TrendingUp },
    { href: '/admin/food', label: 'Food Court', icon: Utensils },
]

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <>
            {/* Mobile Menu Button - Fixed Top Right */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 right-4 z-50 md:hidden bg-background/80 backdrop-blur-sm border border-border"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-64 bg-background border-l border-border z-40
                    transform transition-transform duration-300 ease-in-out md:hidden
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                <div className="flex flex-col h-full p-6 pt-20">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold">Admin Menu</h2>
                        <p className="text-sm text-muted-foreground">A&H Futsal</p>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                        }
                                    `}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="flex gap-2 mt-4">
                        <ModeToggle />
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>



            {/* Desktop Sidebar */}
            <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-30">
                <div className="flex flex-col h-full p-6">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold">Admin Panel</h2>
                        <p className="text-sm text-muted-foreground">A&H Futsal</p>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                        }
                                    `}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="flex gap-2 mt-4 border-t border-border pt-4">
                        <ModeToggle />
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
