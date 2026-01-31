"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Loader2, DollarSign, Clock } from 'lucide-react'
import { checkAdminAccess, getAllPricing, updatePricing, type PricingConfig } from '@/lib/admin-data'
import { formatTime12h } from '@/lib/data'

export default function PricingManagement() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [pricing, setPricing] = useState<PricingConfig[]>([])
    const [editedParams, setEditedParams] = useState<Record<string, { price: number, isPrime: boolean }>>({})

    useEffect(() => {
        checkAccess()
    }, [])

    const checkAccess = async () => {
        const hasAccess = await checkAdminAccess()
        if (!hasAccess) {
            router.push('/login')
            return
        }
        loadPricing()
    }

    const loadPricing = async () => {
        const data = await getAllPricing()
        setPricing(data)
        // Initialize edited params
        const params: any = {}
        data.forEach(p => {
            params[p.time_slot] = { price: p.price_lkr, isPrime: p.is_prime_time }
        })
        setEditedParams(params)
        setLoading(false)
    }

    const handleUpdate = async (timeSlot: string) => {
        const updates = editedParams[timeSlot]
        if (!updates) return

        setSaving(timeSlot)
        const success = await updatePricing(timeSlot, updates.price, updates.isPrime)

        if (success) {
            // Update local state to show saved
            setPricing(pricing.map(p =>
                p.time_slot === timeSlot
                    ? { ...p, price_lkr: updates.price, is_prime_time: updates.isPrime }
                    : p
            ))
        } else {
            alert('Failed to update pricing')
        }
        setSaving(null)
    }

    const handleBulkUpdate = async (type: 'base' | 'peak', price: number) => {
        if (!price || price <= 0) return
        if (!confirm(`Are you sure you want to set all ${type} hours to LKR ${price}?`)) return

        setSaving('bulk')

        const updates = pricing.filter(p => type === 'base' ? !p.is_prime_time : p.is_prime_time)
        let successCount = 0

        for (const p of updates) {
            const success = await updatePricing(p.time_slot, price, p.is_prime_time)
            if (success) successCount++
        }

        if (successCount > 0) {
            alert(`Updated ${successCount} slots successfully`)
            loadPricing()
        }

        setSaving(null)
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
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
                        <h1 className="text-3xl font-bold">Pricing Management</h1>
                        <p className="text-muted-foreground">Configure slot prices and peak hours</p>
                    </div>
                </div>

                {/* Bulk Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Bulk Updates</CardTitle>
                        <CardDescription>Quickly set prices for standard groups</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Standard Hours</p>
                                <p className="text-xs text-muted-foreground">Usually daytime</p>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    className="w-24 h-9"
                                    placeholder="5000"
                                    id="bulk-std-price"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        const val = (document.getElementById('bulk-std-price') as HTMLInputElement).value
                                        handleBulkUpdate('base', parseInt(val))
                                    }}
                                    disabled={saving === 'bulk'}
                                >
                                    Set All
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/20">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
                                <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Peak Hours</p>
                                <p className="text-xs text-muted-foreground">Usually evenings/weekends</p>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    className="w-24 h-9"
                                    placeholder="6000"
                                    id="bulk-peak-price"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        const val = (document.getElementById('bulk-peak-price') as HTMLInputElement).value
                                        handleBulkUpdate('peak', parseInt(val))
                                    }}
                                    disabled={saving === 'bulk'}
                                >
                                    Set All
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Slots Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hourly Slot Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <div className="min-w-[600px] grid grid-cols-4 p-3 bg-muted font-medium text-sm">
                                <div>Time Slot</div>
                                <div>Type</div>
                                <div>Price (LKR)</div>
                                <div className="text-right">Actions</div>
                            </div>
                            <div className="divide-y">
                                {pricing.map((slot) => {
                                    const isEdited =
                                        editedParams[slot.time_slot]?.price !== slot.price_lkr ||
                                        editedParams[slot.time_slot]?.isPrime !== slot.is_prime_time

                                    return (
                                        <div key={slot.id} className="min-w-[600px] grid grid-cols-4 p-3 items-center gap-4 hover:bg-muted/30 transition-colors">
                                            <div className="font-mono font-medium">
                                                {formatTime12h(slot.time_slot)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={editedParams[slot.time_slot]?.isPrime || false}
                                                    onChange={(e) => setEditedParams({
                                                        ...editedParams,
                                                        [slot.time_slot]: {
                                                            ...editedParams[slot.time_slot],
                                                            isPrime: e.target.checked
                                                        }
                                                    })}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    id={`prime-${slot.id}`}
                                                />
                                                <label
                                                    htmlFor={`prime-${slot.id}`}
                                                    className={`text-sm px-2 py-0.5 rounded-full ${editedParams[slot.time_slot]?.isPrime ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'text-muted-foreground'}`}
                                                >
                                                    {editedParams[slot.time_slot]?.isPrime ? 'Peak Hour' : 'Standard'}
                                                </label>
                                            </div>
                                            <div>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-xs text-muted-foreground">LKR</span>
                                                    <Input
                                                        type="number"
                                                        value={editedParams[slot.time_slot]?.price || 0}
                                                        onChange={(e) => setEditedParams({
                                                            ...editedParams,
                                                            [slot.time_slot]: {
                                                                ...editedParams[slot.time_slot],
                                                                price: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                        className="pl-9 h-8 w-32"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {isEdited && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdate(slot.time_slot)}
                                                        disabled={saving === slot.time_slot}
                                                    >
                                                        {saving === slot.time_slot ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Save className="h-4 w-4" />
                                                        )}
                                                        <span className="ml-2">Save</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
