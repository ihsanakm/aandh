"use client"

import * as React from "react"
import { addDays, format, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    selectedDate: Date
    onSelect: (date: Date) => void
}

export function HorizontalDatePicker({ selectedDate, onSelect }: DatePickerProps) {
    const dates = React.useMemo(() => {
        return Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i))
    }, [])

    const scrollRef = React.useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef
            const scrollAmount = 200
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
        }
    }

    return (
        <div className="relative group">
            {/* Left Arrow */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-[40px] -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 backdrop-blur-sm -ml-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 shadow-sm"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <div
                ref={scrollRef}
                className="flex w-full overflow-x-auto pb-4 no-scrollbar gap-3 px-1 scroll-smooth"
            >
                {dates.map((date) => {
                    const isSelected = isSameDay(date, selectedDate)
                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onSelect(date)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-2xl border transition-all shrink-0",
                                isSelected
                                    ? "bg-primary border-primary text-primary-foreground shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                                    : "bg-card border-white/5 text-muted-foreground hover:bg-white/5"
                            )}
                        >
                            <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                                {format(date, "EEE")}
                            </span>
                            <span className={cn("text-xl font-bold", isSelected ? "scale-110" : "")}>
                                {format(date, "d")}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Right Arrow */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-[40px] -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 backdrop-blur-sm -mr-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    )
}

import { ChevronLeft, ChevronRight } from "lucide-react"
