"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    DollarSign,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    TrendingUp,
    Download
} from 'lucide-react'
import {
    checkAdminAccess,
    getBookingStats,
    getTotalIncome,
    type BookingStats
} from '@/lib/admin-data'

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<BookingStats | null>(null)
    const [totalIncome, setTotalIncome] = useState(0)
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all')

    useEffect(() => {
        checkAccess()
    }, [])

    useEffect(() => {
        loadStats()
    }, [dateRange])

    const checkAccess = async () => {
        const hasAccess = await checkAdminAccess()
        if (!hasAccess) {
            router.push('/')
            return
        }
        setLoading(false)
    }

    const loadStats = async () => {
        const today = new Date()
        let startDate: string | undefined

        switch (dateRange) {
            case 'today':
                startDate = today.toISOString().split('T')[0]
                break
            case 'week':
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                startDate = weekAgo.toISOString().split('T')[0]
                break
            case 'month':
                const monthAgo = new Date(today)
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                startDate = monthAgo.toISOString().split('T')[0]
                break
        }

        const [statsData, income] = await Promise.all([
            getBookingStats(startDate),
            getTotalIncome(startDate)
        ])

        setStats(statsData)
        setTotalIncome(income)
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">A&H Futsal Management</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={dateRange === 'today' ? 'default' : 'outline'}
                            onClick={() => setDateRange('today')}
                            size="sm"
                        >
                            Today
                        </Button>
                        <Button
                            variant={dateRange === 'week' ? 'default' : 'outline'}
                            onClick={() => setDateRange('week')}
                            size="sm"
                        >
                            Week
                        </Button>
                        <Button
                            variant={dateRange === 'month' ? 'default' : 'outline'}
                            onClick={() => setDateRange('month')}
                            size="sm"
                        >
                            Month
                        </Button>
                        <Button
                            variant={dateRange === 'all' ? 'default' : 'outline'}
                            onClick={() => setDateRange('all')}
                            size="sm"
                        >
                            All Time
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                LKR {totalIncome.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                From paid bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.total_bookings || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.confirmed_bookings || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.unpaid_bookings || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting payment
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => router.push('/admin/bookings')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Manage Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View, edit, and manage all bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => router.push('/admin/pricing')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Pricing Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Update slot prices and prime time rates
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => router.push('/admin/closures')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <XCircle className="h-5 w-5" />
                                Slot Closures
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Block specific slots or entire days
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => router.push('/admin/users')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Manage moderators and user roles
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => router.push('/admin/reports')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Download booking reports and receipts
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => router.push('/admin/available-slots')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Available Slots
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View free slots and availability
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Status Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm">Paid</span>
                                </div>
                                <span className="font-semibold">{stats?.paid_bookings || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm">Unpaid</span>
                                </div>
                                <span className="font-semibold">{stats?.unpaid_bookings || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <span className="text-sm">Cancelled</span>
                                </div>
                                <span className="font-semibold">{stats?.cancelled_bookings || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
