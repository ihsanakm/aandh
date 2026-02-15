"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    DollarSign,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    TrendingUp,
    Download,
    Utensils,
    ArrowRight,
    Activity,
    LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
    checkAdminAccess,
    getBookingStats,
    type BookingStats
} from '@/lib/admin-data'

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<BookingStats | null>(null)
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')

    useEffect(() => {
        checkAccess()
    }, [])

    useEffect(() => {
        loadStats()
    }, [dateRange])

    const checkAccess = async () => {
        const hasAccess = await checkAdminAccess()
        if (!hasAccess) {
            router.push('/login')
            return
        }
        setLoading(false)
    }

    const loadStats = async () => {
        // Use local time for correct date filtering
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        let startDate: string | null = null
        let endDate: string | null = null

        switch (dateRange) {
            case 'all':
                startDate = null;
                endDate = null;
                break;
            case 'today':
                startDate = todayStr
                endDate = todayStr
                break
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                const wYear = weekAgo.getFullYear();
                const wMonth = String(weekAgo.getMonth() + 1).padStart(2, '0');
                const wDay = String(weekAgo.getDate()).padStart(2, '0');
                startDate = `${wYear}-${wMonth}-${wDay}`;
                endDate = todayStr
                break
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                const mYear = monthAgo.getFullYear();
                const mMonth = String(monthAgo.getMonth() + 1).padStart(2, '0');
                const mDay = String(monthAgo.getDate()).padStart(2, '0');
                startDate = `${mYear}-${mMonth}-${mDay}`;
                endDate = todayStr
                break
        }

        const statsData = await getBookingStats(startDate || undefined, endDate || undefined)
        setStats(statsData)
    }

    // Helper calculate percentages safely
    const getPercent = (val: number, total: number) => {
        if (!total) return 0;
        return Math.round((val / total) * 100);
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground animate-pulse">Loading Dashboard...</p>
                </div>
            </div>
        )
    }

    const totalBookings = stats?.total_bookings || 0;
    const paidPercent = getPercent(stats?.paid_bookings || 0, totalBookings);
    const unpaidPercent = getPercent(stats?.unpaid_bookings || 0, totalBookings);
    const cancelledPercent = getPercent(stats?.cancelled_bookings || 0, totalBookings);

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10 selection:bg-primary/20">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Admin Dashboard</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            Overview for <span className="text-foreground font-medium capitalize">{dateRange === 'all' ? 'All Time' : dateRange}</span>
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="bg-card p-1 rounded-lg border border-border inline-flex shadow-sm">
                            {(['today', 'week', 'month', 'all'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize ${dateRange === range
                                        ? 'bg-primary text-black shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        <ModeToggle />

                        <Button
                            variant="outline"
                            size="icon"
                            className="md:hidden border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
                            onClick={async () => {
                                await supabase.auth.signOut()
                                router.push('/login')
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            className="hidden md:flex gap-2 border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
                            onClick={async () => {
                                await supabase.auth.signOut()
                                router.push('/login')
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </Button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Income"
                        value={`LKR ${(stats?.total_income || 0).toLocaleString()}`}
                        icon={DollarSign}
                        trend="Revenue"
                        color="text-primary"
                        bg="bg-primary/10"
                    />
                    <StatCard
                        title="Total Bookings"
                        value={totalBookings.toString()}
                        icon={Calendar}
                        trend="Total Volume"
                        color="text-blue-500"
                        bg="bg-blue-500/10"
                    />
                    <StatCard
                        title="Confirmed"
                        value={stats?.confirmed_bookings.toString() || "0"}
                        icon={CheckCircle}
                        trend="Active Sessions"
                        color="text-emerald-500"
                        bg="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Pending Payment"
                        value={stats?.unpaid_bookings.toString() || "0"}
                        icon={Clock}
                        trend="Action Needed"
                        color="text-orange-500"
                        bg="bg-orange-500/10"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Visual Breakdown (Infographic) */}
                    <Card className="lg:col-span-2 border-none bg-card/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Booking Status Distribution</CardTitle>
                            <CardDescription>Visual breakdown of booking statuses and success rate</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Simple Stacked Bar */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                    <span>Overall Composition</span>
                                    <span>100%</span>
                                </div>
                                <div className="h-6 w-full rounded-full bg-secondary/10 overflow-hidden flex">
                                    <div style={{ width: `${paidPercent}%` }} className="h-full bg-green-500 hover:opacity-90 transition-all" title={`Paid: ${paidPercent}%`} />
                                    <div style={{ width: `${unpaidPercent}%` }} className="h-full bg-yellow-500 hover:opacity-90 transition-all" title={`Unpaid: ${unpaidPercent}%`} />
                                    <div style={{ width: `${cancelledPercent}%` }} className="h-full bg-red-500 hover:opacity-90 transition-all" title={`Cancelled: ${cancelledPercent}%`} />
                                </div>
                                <div className="flex gap-6 text-xs text-muted-foreground justify-center pt-2">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Paid ({paidPercent}%)</div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Unpaid ({unpaidPercent}%)</div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Cancelled ({cancelledPercent}%)</div>
                                </div>
                            </div>

                            {/* Detailed Stats Row */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                                <div className="text-center p-4 rounded-xl bg-background/50 border border-border">
                                    <div className="text-3xl font-bold text-foreground mb-1">{stats?.completed_bookings || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Completed</div>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-background/50 border border-border">
                                    <div className="text-3xl font-bold text-red-500 mb-1">{stats?.cancelled_bookings || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cancelled</div>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-background/50 border border-border">
                                    <div className="text-3xl font-bold text-green-600 mb-1">{stats?.paid_bookings || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Fully Paid</div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Available Slots Mini-Widget */}
                    <Card className="border-none bg-gradient-to-br from-primary/10 to-transparent flex flex-col justify-center items-center text-center p-6 space-y-4">
                        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">Check Availability</h3>
                        <p className="text-muted-foreground">View real-time slot status for upcoming days.</p>
                        <Button className="w-full font-bold bg-primary text-black hover:bg-primary/90" size="lg" onClick={() => router.push('/admin/available-slots')}>
                            View Slots
                        </Button>
                    </Card>
                </div>

                {/* Quick Actions / Navigation Grid */}
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-6">Quick Management</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <NavCard
                            title="Bookings"
                            icon={Calendar}
                            desc="Manage Sessions"
                            path="/admin/bookings"
                            router={router}
                        />
                        <NavCard
                            title="Pricing"
                            icon={DollarSign}
                            desc="Update Rates"
                            path="/admin/pricing"
                            router={router}
                        />
                        <NavCard
                            title="Closures"
                            icon={XCircle}
                            desc="Block Slots"
                            path="/admin/closures"
                            router={router}
                        />
                        <NavCard
                            title="Users"
                            icon={Users}
                            desc="Staff Access"
                            path="/admin/users"
                            router={router}
                        />
                        <NavCard
                            title="Food Court"
                            icon={Utensils}
                            desc="Manage Menu"
                            path="/admin/food"
                            router={router}
                        />
                        <NavCard
                            title="Reports"
                            icon={Download}
                            desc="Export Data"
                            path="/admin/reports"
                            router={router}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, trend, color, bg }: any) {
    return (
        <Card className="border-none bg-card/60 backdrop-blur-sm hover:translate-y-[-2px] transition-transform duration-300">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${bg} ${color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    {/* Optional trend indicator could go here */}
                </div>
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function NavCard({ title, desc, icon: Icon, path, router }: any) {
    return (
        <div
            onClick={() => router.push(path)}
            className="group cursor-pointer p-4 rounded-xl border border-border bg-card/40 hover:bg-card/80 hover:border-primary/30 transition-all duration-300 flex items-center gap-4"
        >
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-black transition-colors">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
    )
}
