"use client"

import * as React from "react"
import { HorizontalDatePicker } from "./date-picker"
import { TimeSlotSelect } from "./time-slot-select"
import { TimeSlot, Booking, getSlots, createBooking, formatTime12h } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, PartyPopper } from "lucide-react"
import jsPDF from "jspdf"

export function BookingWidget() {
    const [date, setDate] = React.useState<Date>(new Date())
    const [slots, setSlots] = React.useState<TimeSlot[]>([])

    // Range Selection State
    const [startTime, setStartTime] = React.useState<string | null>(null)
    const [endTime, setEndTime] = React.useState<string | null>(null)

    // Derived State - Price removed

    const isValidRange = React.useMemo(() => {
        if (!startTime || !endTime) return false
        return slots
            .filter(s => s.id >= startTime && s.id < endTime)
            .every(s => s.isAvailable)
    }, [startTime, endTime, slots])

    // Stages: 'select' -> 'details' -> 'confirming' -> 'success'
    const [stage, setStage] = React.useState<'select' | 'details' | 'confirming' | 'success'>('select')
    const [isLoadingSlots, setIsLoadingSlots] = React.useState(false)

    const [formData, setFormData] = React.useState({ name: '', mobile: '' })
    const [confirmedBooking, setConfirmedBooking] = React.useState<Booking | null>(null)

    // Fetch slots on date change
    React.useEffect(() => {
        setIsLoadingSlots(true)
        setStartTime(null)
        setEndTime(null)
        getSlots(date).then((data) => {
            setSlots(data)
            setIsLoadingSlots(false)
        })
    }, [date])

    // PDF Generation Function
    const generateAndDownloadPDF = (booking: Booking) => {
        const doc = new jsPDF()

        // Set font sizes and styles
        doc.setFontSize(20)
        doc.setFont("helvetica", "bold")
        doc.text("A&H FUTSAL", 105, 20, { align: "center" })

        doc.setFontSize(16)
        doc.text("BOOKING RECEIPT", 105, 30, { align: "center" })

        // Draw a line
        doc.setLineWidth(0.5)
        doc.line(20, 35, 190, 35)

        // Booking details
        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")

        let yPos = 50
        const lineHeight = 10

        doc.setFont("helvetica", "bold")
        doc.text("Booking ID:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(booking.id.substring(0, 8).toUpperCase(), 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Date:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }), 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Time:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(`${formatTime12h(booking.startTime)} - ${formatTime12h(booking.endTime)}`, 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Court:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text("Single Court", 70, yPos)

        // Customer details section
        yPos += lineHeight * 2
        doc.setLineWidth(0.5)
        doc.line(20, yPos - 5, 190, yPos - 5)

        doc.setFont("helvetica", "bold")
        doc.text("Customer:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(booking.userName, 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Mobile:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(booking.userMobile, 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Status:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(booking.status.toUpperCase(), 70, yPos)

        // Footer
        yPos += lineHeight * 2
        doc.setLineWidth(0.5)
        doc.line(20, yPos - 5, 190, yPos - 5)

        doc.setFontSize(10)
        doc.setFont("helvetica", "italic")
        doc.text("Please show this receipt at the venue.", 105, yPos + 5, { align: "center" })

        doc.setFontSize(8)
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 15, { align: "center" })

        // Save the PDF
        doc.save(`A&H-Futsal-Receipt-${booking.id.substring(0, 8)}.pdf`)
    }

    const handleBook = async () => {
        if (!startTime || !endTime) return
        setStage('confirming')

        try {
            // Logic: createBooking now accepts range
            const booking = await createBooking({
                date: date.toISOString(),
                startTime,
                endTime,
                userName: formData.name,
                userMobile: formData.mobile,
            })

            setConfirmedBooking(booking as Booking)

            // Refresh slots to show updated availability
            await getSlots(date).then(setSlots)

            setStage('success')

            // Auto-download receipt after a short delay
            setTimeout(() => {
                generateAndDownloadPDF(booking as Booking)
            }, 500)
        } catch (error) {
            console.error(error)
            alert("Booking Failed: " + (error instanceof Error ? error.message : "Unknown error"))
            setStage('details')
            // Refresh slots on error too
            getSlots(date).then(setSlots)
        }
    }

    // --- Views ---

    if (stage === 'success' && confirmedBooking) {
        return (
            <Card className="mx-auto w-full max-w-md border-primary/50 bg-primary/10 backdrop-blur-3xl">
                <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-4 rounded-full bg-primary/20 p-4 ring-1 ring-primary/50">
                        <PartyPopper className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
                    <p className="mt-2 text-muted-foreground">
                        {date.toLocaleDateString()} <br />
                        {confirmedBooking.startTime && formatTime12h(confirmedBooking.startTime)} - {confirmedBooking.endTime && formatTime12h(confirmedBooking.endTime)}
                    </p>

                    <p className="mt-4 text-sm text-green-400">
                        ✓ Receipt has been downloaded automatically
                    </p>

                    <div className="mt-8 flex w-full flex-col gap-3">
                        <Button className="w-full text-lg" size="lg" onClick={() => {
                            generateAndDownloadPDF(confirmedBooking)
                        }}>
                            <Download className="mr-2 h-5 w-5" /> Download Receipt Again
                        </Button>
                        <Button variant="ghost" onClick={async () => {
                            setStage('select')
                            setStartTime(null)
                            setEndTime(null)
                            setFormData({ name: '', mobile: '' })
                            setConfirmedBooking(null)
                            // Refresh slots when going back
                            await getSlots(date).then(setSlots)
                        }}>
                            Book Another Slot
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (stage === 'details') {
        return (
            <Card className="mx-auto w-full max-w-md animate-in slide-in-from-right-8 fade-in">
                <CardContent className="p-6">
                    <div className="mb-6 flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setStage('select')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h3 className="text-xl font-semibold">Enter Details</h3>
                    </div>

                    <div className="mb-6 rounded-lg bg-white/5 p-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-muted-foreground">Time:</span>
                            <span>{startTime && formatTime12h(startTime)} - {endTime && formatTime12h(endTime)}</span>
                        </div>

                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-muted-foreground">Full Name</label>
                            <Input
                                autoFocus
                                placeholder="Cristiano Ronaldo"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-muted-foreground">Mobile Number</label>
                            <Input
                                type="tel"
                                placeholder="050 123 4567"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button
                            className="w-full text-base font-semibold"
                            size="lg"
                            disabled={!formData.name || !formData.mobile}
                            onClick={handleBook}
                        >
                            Confirm Booking
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-left-8 fade-in">
            {/* Date Picker */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white px-1">Select Date</h3>
                <HorizontalDatePicker selectedDate={date} onSelect={setDate} />
            </div>

            {/* Slots */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white px-1 flex justify-between items-center">
                    Select Time
                    <span className="text-xs font-normal text-muted-foreground">Single Court</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    <TimeSlotSelect
                        label="Start Time"
                        placeholder="Start"
                        slots={slots}
                        isLoading={isLoadingSlots}
                        selectedSlotId={startTime}
                        onSelect={(id) => {
                            setStartTime(id)
                            setEndTime(null) // Reset end time on start change
                        }}
                    />
                    <TimeSlotSelect
                        label="End Time"
                        placeholder="End"
                        // Only show slots AFTER start time
                        slots={startTime ? slots.filter(s => s.id > startTime) : []}
                        isLoading={isLoadingSlots}
                        selectedSlotId={endTime}
                        onSelect={setEndTime}
                    />
                </div>


            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/10 sm:relative sm:border-0 sm:bg-transparent text-center z-10">
                <Button
                    size="lg"
                    className="w-full max-w-md shadow-lg shadow-primary/25"
                    disabled={!startTime || !endTime || !isValidRange}
                    onClick={() => setStage('details')}
                >
                    {isValidRange ? "Continue" : "Select Available Range"}
                </Button>
            </div>

            {/* Spacer for fixed bottom bar on mobile */}
            <div className="h-20 sm:hidden"></div>
        </div>
    )
}
