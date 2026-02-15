"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Trash2, Calendar, AlertTriangle } from 'lucide-react'
import { checkAdminAccess, getClosures, createClosure, deleteClosure, type SlotClosure } from '@/lib/admin-data'
import { formatTime12h } from '@/lib/data'

export default function SlotClosures() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [closures, setClosures] = useState<SlotClosure[]>([])

    // Form State
    const [date, setDate] = useState('')
    const [timeSlot, setTimeSlot] = useState('full_day')
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        checkAccess()
    }, [])

    const checkAccess = async () => {
        const hasAccess = await checkAdminAccess()
        if (!hasAccess) {
            router.push('/login')
            return
        }
        loadClosures()
    }

    const loadClosures = async () => {
        const today = new Date().toISOString().split('T')[0]
        const data = await getClosures(today)
        setClosures(data)
        setLoading(false)
    }

    const handleCreate = async () => {
        if (!date || !reason) {
            alert('Please select a date and enter a reason')
            return
        }

        setSubmitting(true)
        const closureData = {
            date,
            time_slot: timeSlot === 'full_day' ? undefined : timeSlot,
            reason,
            court_id: 'court_1', // Default for now
            is_active: true
        }

        const success = await createClosure(closureData)

        if (success) {
            setReason('')
            // Keep date for convenience
            loadClosures()
        } else {
            alert('Failed to create closure')
        }
        setSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this closure?')) return

        const success = await deleteClosure(id)
        if (success) {
            loadClosures()
        } else {
            alert('Failed to remove closure')
        }
    }

    // Generate time slots
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0') + ':00'
        return { value: hour, label: formatTime12h(hour) }
    })

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.push('/admin')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Slot Closures</h1>
                        <p className="text-muted-foreground">Block dates or times for maintenance/holidays</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Create Closure Form */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Add New Closure</CardTitle>
                            <CardDescription>Block specific time or full day</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Time Slot</label>
                                <Select value={timeSlot} onValueChange={setTimeSlot}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_day">All Day (Full Closure)</SelectItem>
                                        {timeSlots.map(slot => (
                                            <SelectItem key={slot.value} value={slot.value}>
                                                {slot.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reason</label>
                                <Input
                                    placeholder="e.g. Maintenance"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handleCreate} disabled={submitting}>
                                <Plus className="h-4 w-4 mr-2" />
                                {submitting ? 'Adding...' : 'Add Closure'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Active Closures List */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Upcoming Closures</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {closures.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                                    No active closures found
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {closures.map(closure => (
                                        <div key={closure.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full mt-1">
                                                    <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold flex items-center gap-2">
                                                        {new Date(closure.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        {closure.time_slot ? (
                                                            <Badge variant="outline">{formatTime12h(closure.time_slot)}</Badge>
                                                        ) : (
                                                            <Badge variant="destructive">FULL DAY</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {closure.reason}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(closure.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
