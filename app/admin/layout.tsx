"use client"

import { MobileNav } from '@/components/admin/mobile-nav'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <MobileNav />
            {/* Main Content - with padding for desktop sidebar */}
            <main className="md:pl-64 min-h-screen">
                {children}
            </main>
        </div>
    )
}
