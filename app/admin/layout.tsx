"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, CalendarDays, Users, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ]

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-card hidden md:flex flex-col">
                <div className="flex h-16 items-center px-6 border-b border-white/5">
                    <span className="font-bold tracking-tight text-xl">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white">
                            <LogOut className="mr-2 h-4 w-4" />
                            Exit
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header (TODO) */}

            {/* Main Content */}
            <main className="md:ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
