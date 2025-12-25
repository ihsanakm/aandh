"use client"

import * as React from "react"
import { TimeSlot, formatTime12h } from "@/lib/data"
import { cn } from "@/lib/utils"
import { ChevronDown, Loader2 } from "lucide-react"

interface TimeSlotSelectProps {
    slots: TimeSlot[]
    selectedSlotId: string | null
    onSelect: (slotId: string) => void
    isLoading?: boolean
    label?: string
    placeholder?: string
}

export function TimeSlotSelect({ slots, selectedSlotId, onSelect, isLoading, label, placeholder }: TimeSlotSelectProps) {
    if (isLoading) {
        return (
            <div className="flex h-12 w-full items-center justify-center rounded-lg border border-white/10 bg-card">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="relative">
            {label && <label className="mb-1.5 block text-xs font-medium text-muted-foreground ml-1">{label}</label>}
            <div className="relative">
                <select
                    value={selectedSlotId || ""}
                    onChange={(e) => onSelect(e.target.value)}
                    className={cn(
                        "h-12 w-full appearance-none rounded-xl border border-white/10 bg-card px-4 pl-4 pr-10 text-base outline-none transition-colors",
                        "focus:border-primary focus:ring-1 focus:ring-primary",
                        "disabled:opacity-50",
                        !selectedSlotId && "text-muted-foreground"
                    )}
                >
                    <option value="" disabled>{placeholder || "Select Time..."}</option>
                    {slots.map((slot) => (
                        <option
                            key={slot.id}
                            value={slot.id}
                            className="bg-zinc-900 py-2"
                            disabled={!slot.isAvailable}
                        >
                            {formatTime12h(slot.time)} {slot.isAvailable ? "" : "(Booked)"}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <ChevronDown className="h-5 w-5" />
                </div>
            </div>
        </div>
    )
}
