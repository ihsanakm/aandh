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
            <div className="flex h-10 sm:h-12 w-full items-center justify-center rounded-lg border border-white/10 bg-card">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="relative min-w-0">
            {label && <label className="mb-1 sm:mb-1.5 block text-[10px] sm:text-xs font-medium text-muted-foreground ml-1">{label}</label>}
            <div className="relative">
                <select
                    value={selectedSlotId || ""}
                    onChange={(e) => onSelect(e.target.value)}
                    className={cn(
                        "h-10 sm:h-12 w-full appearance-none rounded-lg sm:rounded-xl border border-white/10 bg-card px-2 sm:px-4 pr-7 sm:pr-10 text-sm sm:text-base outline-none transition-colors",
                        "focus:border-primary focus:ring-1 focus:ring-primary",
                        "disabled:opacity-50",
                        !selectedSlotId && "text-muted-foreground"
                    )}
                >
                    <option value="" disabled>{placeholder || "Select..."}</option>
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
                <div className="pointer-events-none absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
            </div>
        </div>
    )
}
