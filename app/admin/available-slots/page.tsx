"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import { checkAdminAccess, getAvailableSlots } from '@/lib/admin-data'
import { formatTime12h } from '@/lib/data'

export default function AvailableSlotsViewer() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [slots, setSlots] = useState<string[]>([])

    useEffect(() => {
        checkAccess()
    }, [])

    // Fetch slots when date changes
    useEffect(() => {
        loadSlots()
    }, [date])

    const checkAccess = async () => {
        const hasAccess = await checkAdminAccess()
        if (!hasAccess) {
            router.push('/login')
            return
        }
        setLoading(false) // Initial load done
    }

    const loadSlots = async () => {
        setLoading(true)
        const data = await getAvailableSlots(date)
        setSlots(data)
        setLoading(false)
    }

    // Generate all 24h slots for grid comparison
    const allHours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.push('/admin')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Availability Viewer</h1>
                        <p className="text-muted-foreground">Check court availability for any date</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Card className="w-full">
                        <CardHeader className="flex flex-col sm:flex-row items-center justify-between pb-2 gap-4">
                            <CardTitle>Select Date</CardTitle>
                            <Input
                                type="date"
                                className="w-full sm:w-auto"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4">
                                <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                                    Time Slots ({new Date(date).toLocaleDateString()})
                                </h3>

                                {loading ? (
                                    <div className="py-8 text-center text-muted-foreground">Checking availability...</div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {allHours.map(hour => {
                                            const isAvailable = slots.includes(hour)
                                            return (
                                                <div
                                                    key={hour}
                                                    className={`
                                                        p-3 rounded-lg border text-center transition-all
                                                        ${isAvailable
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                            : 'bg-muted/50 border-transparent opacity-50 grayscale'}
                                                    `}
                                                >
                                                    <div className="font-bold text-lg mb-1">{formatTime12h(hour)}</div>
                                                    {isAvailable ? (
                                                        <Badge variant="success" className="w-full justify-center">Available</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="w-full justify-center">Unavailable</Badge>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
