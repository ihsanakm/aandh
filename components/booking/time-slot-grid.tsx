"use client"

import * as React from "react"
import { TimeSlot } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface TimeSlotGridProps {
    slots: TimeSlot[]
    selectedSlotId: string | null
    onSelect: (slotId: string) => void
    isLoading?: boolean
}

export function TimeSlotGrid({ slots, selectedSlotId, onSelect, isLoading }: TimeSlotGridProps) {
    if (isLoading) {
        return (
            <div className="flex h-40 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {slots.map((slot) => {
                const isSelected = selectedSlotId === slot.id
                return (
                    <button
                        key={slot.id}
                        disabled={!slot.isAvailable}
                        onClick={() => onSelect(slot.id)}
                        className={cn(
                            "relative flex flex-col items-center justify-center rounded-xl border p-3 transition-all",
                            slot.isAvailable
                                ? isSelected
                                    ? "border-primary bg-primary/20 text-primary ring-1 ring-primary shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                                    : "border-white/10 bg-card hover:border-primary/50 hover:bg-white/5"
                                : "bg-white/5 border-transparent opacity-50 cursor-not-allowed text-muted-foreground"
                        )}
                    >
                        <span className="text-lg font-semibold tracking-tight">{slot.time}</span>
                        <span className="text-[10px] uppercase tracking-wider opacity-70">
                            {slot.isAvailable ? "Available" : "Booked"}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
