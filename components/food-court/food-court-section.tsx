"use client"

import { useEffect, useState } from 'react'
import { supabase, isMockMode } from '@/lib/supabase'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Utensils } from 'lucide-react'

type FoodStall = {
    id: string
    name: string
    description: string
    image_url: string
    cuisine: string
    price_range: string
    is_active: boolean
}

export function FoodCourtSection() {
    const [stalls, setStalls] = useState<FoodStall[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStalls() {
            try {
                if (isMockMode) {
                    throw new Error("Mock Mode enabled");
                }

                const { data, error } = await supabase
                    .from('food_stalls')
                    .select('*')
                    .eq('is_active', true)

                if (error) {
                    console.error('Error fetching food stalls:', error)
                    // Fallback data
                    setStalls([
                        {
                            id: '1',
                            name: 'Burger Barn',
                            description: 'Juicy gourmet burgers and fries.',
                            cuisine: 'American',
                            price_range: '$$',
                            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        },
                        {
                            id: '2',
                            name: 'Smoothie Station',
                            description: 'Fresh fruit smoothies and protein shakes.',
                            cuisine: 'Beverages',
                            price_range: '$',
                            image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        },
                        {
                            id: '3',
                            name: 'Taco Fiesta',
                            description: 'Authentic street tacos and nachos.',
                            cuisine: 'Mexican',
                            price_range: '$$',
                            image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        },
                        {
                            id: '4',
                            name: 'The Wok',
                            description: 'Spicy noodles and stir-fry.',
                            cuisine: 'Asian',
                            price_range: '$$',
                            image_url: 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        },
                        {
                            id: '5',
                            name: 'Pizza Point',
                            description: 'Wood-fired oven pizzas.',
                            cuisine: 'Italian',
                            price_range: '$$',
                            image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        },
                        {
                            id: '6',
                            name: 'The Coffee Bean',
                            description: 'Artisan coffee and pastries.',
                            cuisine: 'Cafe',
                            price_range: '$',
                            image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        },
                        {
                            id: '7',
                            name: 'Gelato Bliss',
                            description: 'Handcrafted Italian ice cream.',
                            cuisine: 'Dessert',
                            price_range: '$',
                            image_url: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        },
                        {
                            id: '8',
                            name: 'Spice Route',
                            description: 'Traditional biryani and curries.',
                            cuisine: 'Indian',
                            price_range: '$$',
                            image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        },
                        {
                            id: '9',
                            name: 'Sushi Roll',
                            description: 'Fresh sushi and sashmi platters.',
                            cuisine: 'Japanese',
                            price_range: '$$$',
                            image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        },
                        {
                            id: '10',
                            name: 'Kebab Corner',
                            description: 'Grilled kebabs and shawarma.',
                            cuisine: 'Middle Eastern',
                            price_range: '$$',
                            image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=600&auto=format&fit=crop',
                            is_active: true
                        }
                    ])
                } else if (data) {
                    setStalls(data)
                }
            } catch (err) {
                console.error('Unexpected error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchStalls()
    }, [])

    if (loading) {
        return (
            <section className="mt-32">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Refuel at Our Food Court</h2>
                    <div className="mt-4 flex justify-center gap-2">
                        <div className="h-2 w-24 animate-pulse rounded bg-white/10"></div>
                    </div>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse"></div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className="mt-32">
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Refuel at Our Food Court</h2>
                <p className="mt-4 text-lg text-muted-foreground">Grab a bite or a refreshing drink after your game.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {stalls.map((stall) => (
                    <div key={stall.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card transition-all hover:scale-105 hover:border-primary/50">
                        <div className="aspect-[4/3] w-full overflow-hidden">
                            <Image
                                src={stall.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                alt={stall.name}
                                width={400}
                                height={300}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>
                        <div className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-bold text-white line-clamp-1">{stall.name}</h3>
                                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    {stall.cuisine}
                                </span>
                            </div>
                            <p className="mb-3 text-sm text-zinc-400 line-clamp-2">{stall.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Utensils className="h-3 w-3" />
                                    Stall
                                </span>
                                <span className="font-medium text-white">{stall.price_range}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
