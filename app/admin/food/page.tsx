"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Utensils,
    Plus,
    Trash2,
    ArrowLeft,
    Save,
    Pencil,
    Eye,
    EyeOff,
    X
} from 'lucide-react'
import { checkAdminAccess } from '@/lib/admin-data'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type FoodStall = {
    id: string
    name: string
    description: string
    image_url: string
    cuisine: string
    price_range: string
    is_active: boolean
}

export default function FoodStallsAdmin() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stalls, setStalls] = useState<FoodStall[]>([])

    // Form State
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<FoodStall>>({
        name: '',
        description: '',
        cuisine: '',
        price_range: '$$',
        image_url: '',
        is_active: true
    })

    useEffect(() => {
        checkAdminAccess().then(hasAccess => {
            if (!hasAccess) router.push('/login')
            else fetchStalls()
        })
    }, [])

    async function fetchStalls() {
        try {
            const { data, error } = await supabase
                .from('food_stalls')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setStalls(data)
        } catch (error) {
            console.error('Error fetching stalls:', error)
        } finally {
            setLoading(false)
        }
    }

    function resetForm() {
        setIsEditing(false)
        setEditingId(null)
        setFormData({
            name: '',
            description: '',
            cuisine: '',
            price_range: '$$',
            image_url: '',
            is_active: true
        })
    }

    function handleEditStart(stall: FoodStall) {
        setFormData({
            name: stall.name,
            description: stall.description,
            cuisine: stall.cuisine,
            price_range: stall.price_range,
            image_url: stall.image_url,
            is_active: stall.is_active
        })
        setEditingId(stall.id)
        setIsEditing(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function handleSave() {
        if (!formData.name || !formData.cuisine) return

        try {
            setLoading(true)

            if (editingId) {
                // Update existing
                const { error } = await supabase
                    .from('food_stalls')
                    .update(formData)
                    .eq('id', editingId)

                if (error) throw error
            } else {
                // Create new
                const { error } = await supabase
                    .from('food_stalls')
                    .insert([formData])

                if (error) throw error
            }

            resetForm()
            fetchStalls()
        } catch (error) {
            console.error('Error saving stall:', error)
            alert('Failed to save stall')
        } finally {
            setLoading(false)
        }
    }

    async function handleToggleActive(id: string, currentStatus: boolean) {
        try {
            // Optimistic update
            setStalls(stalls.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s))

            const { error } = await supabase
                .from('food_stalls')
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) {
                // Revert if error
                setStalls(stalls.map(s => s.id === id ? { ...s, is_active: currentStatus } : s))
                throw error
            }
        } catch (error) {
            console.error('Error toggling status:', error)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this stall?')) return

        try {
            const { error } = await supabase
                .from('food_stalls')
                .delete()
                .eq('id', id)

            if (error) throw error

            setStalls(stalls.filter(s => s.id !== id))
        } catch (error) {
            console.error('Error deleting stall:', error)
            alert('Failed to delete stall')
        }
    }

    if (loading && stalls.length === 0) {
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
                    <h1 className="text-3xl font-bold">Food Court Management</h1>
                </div>

                {isEditing ? (
                    <Card className="border-primary/50">
                        <CardHeader>
                            <CardTitle>{editingId ? 'Edit Stall' : 'Add New Stall'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Burger Barn"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cuisine</label>
                                    <Input
                                        value={formData.cuisine}
                                        onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                                        placeholder="e.g. American"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price Range</label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.price_range}
                                        onChange={e => setFormData({ ...formData, price_range: e.target.value })}
                                    >
                                        <option value="$">$ (Cheap)</option>
                                        <option value="$$">$$ (Moderate)</option>
                                        <option value="$$$">$$$ (Expensive)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Image URL</label>
                                    <Input
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the stall..."
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        className="rounded border-gray-300"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <label htmlFor="active" className="text-sm font-medium">
                                        Is Active?
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={resetForm}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingId ? 'Update Stall' : 'Save Stall'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Stall
                    </Button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stalls.map(stall => (
                        <Card key={stall.id} className={!stall.is_active ? 'opacity-60 grayscale' : ''}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold">{stall.name}</CardTitle>
                                <Utensils className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="aspect-video w-full rounded-md bg-muted overflow-hidden relative group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={stall.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                            alt={stall.name}
                                            className="object-cover w-full h-full"
                                        />
                                        {!stall.is_active && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold backdrop-blur-sm">
                                                INACTIVE
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{stall.description}</p>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                            {stall.cuisine}
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title={stall.is_active ? 'Disable' : 'Enable'}
                                                onClick={() => handleToggleActive(stall.id, stall.is_active)}
                                            >
                                                {stall.is_active ? (
                                                    <Eye className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Edit"
                                                onClick={() => handleEditStart(stall)}
                                            >
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Delete"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                onClick={() => handleDelete(stall.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {stalls.length === 0 && !isEditing && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-white/5 rounded-lg border border-dashed border-white/10">
                            No food stalls found. Add one to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
