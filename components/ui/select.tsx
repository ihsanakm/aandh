"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
    value?: string
    onValueChange?: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType>({
    open: false,
    setOpen: () => { },
})

export function Select({ value, onValueChange, children }: {
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
}) {
    const [open, setOpen] = React.useState(false)

    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    )
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { open, setOpen } = React.useContext(SelectContext)

    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const { value } = React.useContext(SelectContext)
    // In a real implementation this would map value to label
    return <span className="block truncate">{value || placeholder}</span>
}

export function SelectContent({ className, children, position = "popper", ...props }: React.HTMLAttributes<HTMLDivElement> & { position?: "popper" | "item-aligned" }) {
    const { open, setOpen } = React.useContext(SelectContext)

    if (!open) return null

    return (
        <>
            <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
            <div
                className={cn(
                    "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-white/20 bg-slate-950 text-white shadow-md animate-in fade-in-80",
                    position === "popper" && "translate-y-1",
                    className
                )}
                {...props}
            >
                <div className="w-full p-1">{children}</div>
            </div>
        </>
    )
}

export function SelectItem({ className, children, value, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
    const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext)
    const isSelected = selectedValue === value

    return (
        <div
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
                className
            )}
            onClick={(e) => {
                e.stopPropagation()
                onValueChange?.(value)
                setOpen(false)
            }}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
}
