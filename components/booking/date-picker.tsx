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
                className="absolute left-0 top-[35px] sm:top-[40px] -translate-y-1/2 z-10 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-sm -ml-1 sm:-ml-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 shadow-sm"
            >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            <div
                ref={scrollRef}
                className="flex w-full overflow-x-auto pb-3 sm:pb-4 no-scrollbar gap-2 sm:gap-3 scroll-smooth"
            >
                {dates.map((date) => {
                    const isSelected = isSameDay(date, selectedDate)
                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onSelect(date)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[56px] sm:min-w-[70px] h-[68px] sm:h-[80px] rounded-xl sm:rounded-2xl border transition-all shrink-0",
                                isSelected
                                    ? "bg-primary border-primary text-primary-foreground shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                                    : "bg-card border-border text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-80">
                                {format(date, "EEE")}
                            </span>
                            <span className={cn("text-lg sm:text-xl font-bold", isSelected ? "scale-110" : "")}>
                                {format(date, "d")}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Right Arrow */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-[35px] sm:top-[40px] -translate-y-1/2 z-10 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-sm -mr-1 sm:-mr-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
        </div>
    )
}

import { ChevronLeft, ChevronRight } from "lucide-react"
