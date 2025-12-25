import { supabase } from "@/lib/supabase"

export type TimeSlot = {
    id: string;
    time: string;
    isAvailable: boolean;
    price: number;
};

export type Booking = {
    id: string;
    date: string;
    slotId: string; // Keeps reference to start time or comma-separated? Let's use start time for ID generally or first slot.
    startTime: string;
    endTime: string;
    userName: string;
    userMobile: string;
    status: 'confirmed' | 'cancelled';
    paymentStatus: 'paid' | 'unpaid';
    totalPrice: number;
};

export function formatTime12h(time24: string) {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

// Helper to generate 24h slots with 1 hour intervals
const generateSlots = () => {
    const slots: TimeSlot[] = [];
    for (let h = 0; h < 24; h++) {
        const time = `${h.toString().padStart(2, '0')}:00`;
        slots.push({
            id: time,
            time: time,
            isAvailable: true,
            price: 0
        });
    }
    return slots;
};

export const BASE_SLOTS: TimeSlot[] = generateSlots();

export async function getSlots(date: Date): Promise<TimeSlot[]> {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('time_slot')
            .eq('date', dateStr)
            .eq('status', 'confirmed');

        if (error) {
            console.error("Error fetching slots:", error);
            console.error("Error details:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });

            // If table doesn't exist, return all slots as available (fallback mode)
            if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
                console.warn("⚠️ Database table 'bookings' not found. Running in fallback mode with all slots available.");
                console.warn("Please run the schema.sql file in your Supabase SQL Editor to create the required tables.");
                return BASE_SLOTS; // All available
            }

            // For other errors, return all slots as unavailable for safety
            return BASE_SLOTS.map(s => ({ ...s, isAvailable: false }));
        }

        const bookedTimes = new Set(bookings?.map((b: any) => b.time_slot) || []);

        return BASE_SLOTS.map(slot => ({
            ...slot,
            isAvailable: !bookedTimes.has(slot.id)
        }));
    } catch (err) {
        console.error("Network or unexpected error in getSlots:", err);
        console.error("This might indicate a network issue or CORS problem with Supabase.");
        console.error("Please check:");
        console.error("1. Your internet connection");
        console.error("2. Supabase project URL is correct");
        console.error("3. Supabase project is active and not paused");

        // Return all slots as available in case of network error
        return BASE_SLOTS;
    }
}

export async function createBooking(booking: {
    date: string,
    startTime: string,
    endTime: string,
    userName: string,
    userMobile: string
}) {
    try {
        const dateStr = new Date(booking.date).toISOString().split('T')[0];

        // 1. Identify all 1-hour slots in the range
        // The range is [startTime, endTime) -- inclusive of start, exclusive of end
        const slotsInRange = BASE_SLOTS.filter(s => s.id >= booking.startTime && s.id < booking.endTime);

        if (slotsInRange.length === 0) {
            throw new Error("Invalid time range selected.");
        }

        // 2. Check availability for ALL slots
        const { data: existing, error: checkError } = await supabase
            .from('bookings')
            .select('time_slot')
            .eq('date', dateStr)
            .in('time_slot', slotsInRange.map(s => s.id))
            .eq('status', 'confirmed');

        if (checkError) {
            console.error("Error checking slot availability:", checkError);
            throw new Error(`Database error: ${checkError.message}`);
        }

        if (existing && existing.length > 0) {
            throw new Error(`Some slots in this range are already booked: ${existing.map((e: any) => formatTime12h(e.time_slot)).join(', ')}`);
        }

        // 3. Insert Bookings (One per 1-hour slot)
        const inserts = slotsInRange.map(slot => ({
            date: dateStr,
            time_slot: slot.id,
            user_name: booking.userName,
            user_mobile: booking.userMobile,
            status: 'confirmed',
            payment_status: 'unpaid',
        }));

        const { data, error } = await supabase
            .from('bookings')
            .insert(inserts)
            .select();

        if (error) {
            console.error("Booking error:", error);
            console.error("Error details:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw new Error(`Failed to book slots: ${error.message}`);
        }

        const firstBooking = data[0];

        return {
            id: firstBooking.id, // ID of the first slot booking
            date: firstBooking.date,
            slotId: firstBooking.time_slot,
            startTime: booking.startTime,
            endTime: booking.endTime,
            userName: firstBooking.user_name,
            userMobile: firstBooking.user_mobile,
            status: firstBooking.status,
            paymentStatus: firstBooking.payment_status,
            totalPrice: 0
        } as Booking;
    } catch (err) {
        console.error("Unexpected error in createBooking:", err);
        throw err; // Re-throw to be handled by the caller
    }
}

export async function getAllBookings() {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false })
        .order('time_slot', { ascending: true });

    if (error) {
        console.error(error);
        return [];
    }

    return data.map((b: any) => ({
        id: b.id,
        date: b.date,
        slotId: b.time_slot,
        startTime: b.time_slot, // Fallback for single slots
        endTime: b.time_slot, // Fallback
        userName: b.user_name,
        userMobile: b.user_mobile,
        status: b.status,
        paymentStatus: b.payment_status,
        totalPrice: 0 // Unknown for past bookings
    })) as Booking[];
}
