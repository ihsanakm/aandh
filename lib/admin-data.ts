import { supabase, isMockMode } from "@/lib/supabase"

// ============================================
// TYPES
// ============================================

export type UserRole = 'super_admin' | 'moderator' | 'user'

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type PaymentStatus = 'paid' | 'unpaid' | 'pending'
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online'

export interface AdminBooking {
    id: string
    created_at: string
    date: string
    time_slot: string
    court_id: string
    user_name: string
    user_mobile: string
    price_lkr: number
    status: BookingStatus
    payment_status: PaymentStatus
    payment_method?: PaymentMethod
    notes?: string
    cancelled_reason?: string
}

export interface PricingConfig {
    id: string
    time_slot: string
    price_lkr: number
    is_prime_time: boolean
    updated_at: string
}

export interface SlotClosure {
    id: string
    date: string
    time_slot?: string
    court_id: string
    reason: string
    is_active: boolean
    created_at: string
}

export interface BookingStats {
    total_bookings: number
    confirmed_bookings: number
    cancelled_bookings: number
    completed_bookings: number
    paid_bookings: number
    unpaid_bookings: number
    total_income: number
}

export interface UserRoleData {
    id: string
    user_id: string
    role: UserRole
    created_at: string
    email?: string
}

// ============================================
// AUTH & ROLES
// ============================================

export async function getCurrentUserRole(): Promise<UserRole | null> {
    if (isMockMode) return 'super_admin';
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.error('Error fetching user role:', error)
            return null
        }

        return data?.role || null
    } catch (err) {
        console.error('Error in getCurrentUserRole:', err)
        return null
    }
}

export async function checkAdminAccess(): Promise<boolean> {
    const role = await getCurrentUserRole()
    return role === 'super_admin' || role === 'moderator'
}

export async function getAllUsers(): Promise<UserRoleData[]> {
    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (err) {
        console.error('Error fetching users:', err)
        return []
    }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('user_roles')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('user_id', userId)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error updating user role:', err)
        return false
    }
}

// ============================================
// BOOKINGS MANAGEMENT
// ============================================

export async function getAllBookings(filters?: {
    startDate?: string
    endDate?: string
    status?: BookingStatus
    paymentStatus?: PaymentStatus
}): Promise<AdminBooking[]> {
    try {
        if (isMockMode) {
            return [
                {
                    id: 'mock-1',
                    created_at: new Date().toISOString(),
                    date: new Date().toISOString().split('T')[0],
                    time_slot: '10:00',
                    court_id: 'court_1',
                    user_name: 'Mock Super Star',
                    user_mobile: '0123456789',
                    price_lkr: 1500,
                    status: 'confirmed',
                    payment_status: 'paid',
                    payment_method: 'cash'
                }
            ] as AdminBooking[];
        }

        let query = supabase
            .from('bookings')
            .select('*')
            .order('date', { ascending: false })
            .order('time_slot', { ascending: true })

        if (filters?.startDate) {
            query = query.gte('date', filters.startDate)
        }
        if (filters?.endDate) {
            query = query.lte('date', filters.endDate)
        }
        if (filters?.status) {
            query = query.eq('status', filters.status)
        }
        if (filters?.paymentStatus) {
            query = query.eq('payment_status', filters.paymentStatus)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
    } catch (err) {
        console.error('Error fetching bookings:', err)
        return []
    }
}

export async function updateBooking(
    bookingId: string,
    updates: Partial<AdminBooking>
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('bookings')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', bookingId)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error updating booking:', err)
        return false
    }
}

export async function cancelBooking(
    bookingId: string,
    reason: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('bookings')
            .update({
                status: 'cancelled',
                cancelled_reason: reason,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error cancelling booking:', err)
        return false
    }
}

export async function deleteBooking(bookingId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', bookingId)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error deleting booking:', err)
        return false
    }
}

// ============================================
// PRICING MANAGEMENT
// ============================================

export async function getAllPricing(): Promise<PricingConfig[]> {
    try {
        const { data, error } = await supabase
            .from('pricing')
            .select('*')
            .order('time_slot', { ascending: true })

        if (error) throw error
        return data || []
    } catch (err) {
        console.error('Error fetching pricing:', err)
        return []
    }
}

export async function updatePricing(
    timeSlot: string,
    priceLkr: number,
    isPrimeTime: boolean
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('pricing')
            .update({
                price_lkr: priceLkr,
                is_prime_time: isPrimeTime,
                updated_at: new Date().toISOString()
            })
            .eq('time_slot', timeSlot)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error updating pricing:', err)
        return false
    }
}

export async function bulkUpdatePricing(
    updates: { time_slot: string; price_lkr: number; is_prime_time: boolean }[]
): Promise<boolean> {
    try {
        for (const update of updates) {
            await updatePricing(update.time_slot, update.price_lkr, update.is_prime_time)
        }
        return true
    } catch (err) {
        console.error('Error bulk updating pricing:', err)
        return false
    }
}

// ============================================
// SLOT CLOSURES
// ============================================

export async function getSlotClosures(activeOnly: boolean = true): Promise<SlotClosure[]> {
    try {
        let query = supabase
            .from('slot_closures')
            .select('*')
            .order('date', { ascending: true })

        if (activeOnly) {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
    } catch (err) {
        console.error('Error fetching slot closures:', err)
        return []
    }
}

export async function createSlotClosure(closure: {
    date: string
    time_slot?: string
    court_id?: string
    reason: string
}): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('slot_closures')
            .insert({
                ...closure,
                court_id: closure.court_id || 'court_1',
                is_active: true
            })

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error creating slot closure:', err)
        return false
    }
}

export async function deleteSlotClosure(closureId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('slot_closures')
            .update({ is_active: false })
            .eq('id', closureId)

        if (error) throw error
        return true
    } catch (err) {
        console.error('Error deleting slot closure:', err)
        return false
    }
}

// ============================================
// STATISTICS & REPORTS
// ============================================

export async function getBookingStats(
    startDate?: string,
    endDate?: string
): Promise<BookingStats | null> {
    try {
        const { data, error } = await supabase
            .rpc('get_booking_stats', {
                start_date: startDate || null,
                end_date: endDate || null
            })

        if (error) throw error
        return data?.[0] || null
    } catch (err) {
        console.error('Error fetching booking stats:', err)
        return null
    }
}

export async function getTotalIncome(
    startDate?: string,
    endDate?: string
): Promise<number> {
    try {
        const { data, error } = await supabase
            .rpc('get_total_income', {
                start_date: startDate || null,
                end_date: endDate || null
            })

        if (error) throw error
        return data || 0
    } catch (err) {
        console.error('Error fetching total income:', err)
        return 0
    }
}

export async function getAvailableSlots(date: string): Promise<string[]> {
    try {
        // Get all booked slots for the date
        const { data: bookings, error: bookingError } = await supabase
            .from('bookings')
            .select('time_slot')
            .eq('date', date)
            .eq('status', 'confirmed')

        if (bookingError) throw bookingError

        // Get all closed slots for the date
        const { data: closures, error: closureError } = await supabase
            .from('slot_closures')
            .select('time_slot')
            .eq('date', date)
            .eq('is_active', true)

        if (closureError) throw closureError

        // All 24 hourly slots
        const allSlots = Array.from({ length: 24 }, (_, i) =>
            `${i.toString().padStart(2, '0')}:00`
        )

        const bookedSlots = new Set(bookings?.map(b => b.time_slot) || [])
        const closedSlots = new Set(closures?.map(c => c.time_slot).filter(Boolean) || [])

        // Check if entire day is closed
        const isDayClosed = closures?.some(c => !c.time_slot)

        if (isDayClosed) return []

        return allSlots.filter(slot => !bookedSlots.has(slot) && !closedSlots.has(slot))
    } catch (err) {
        console.error('Error fetching available slots:', err)
        return []
    }
}

// ============================================
// SLOT CLOSURES
// ============================================


export async function getClosures(startDate?: string): Promise<SlotClosure[]> {
    try {
        let query = supabase
            .from('slot_closures')
            .select('*')
            .order('date', { ascending: true })
            .order('time_slot', { ascending: true })

        if (startDate) {
            query = query.gte('date', startDate)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    } catch (err) {
        console.error('Error fetching closures:', err)
        return []
    }
}

export async function createClosure(closure: Partial<SlotClosure>): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('slot_closures')
            .insert([closure])
        if (error) throw error
        return true
    } catch (err) {
        console.error('Error creating closure:', err)
        return false
    }
}

export async function deleteClosure(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('slot_closures')
            .delete()
            .eq('id', id)
        if (error) throw error
        return true
    } catch (err) {
        console.error('Error deleting closure:', err)
        return false
    }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

export function generateBookingCSV(bookings: AdminBooking[]): string {
    const headers = [
        'Booking ID',
        'Date',
        'Time',
        'Customer Name',
        'Mobile',
        'Price (LKR)',
        'Status',
        'Payment Status',
        'Payment Method',
        'Notes'
    ]

    const rows = bookings.map(b => [
        b.id,
        b.date,
        b.time_slot,
        b.user_name,
        b.user_mobile,
        b.price_lkr.toString(),
        b.status,
        b.payment_status,
        b.payment_method || '',
        b.notes || ''
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
}

export function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}
