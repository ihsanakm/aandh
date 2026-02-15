"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download, FileText, BarChart } from 'lucide-react'
import { checkAdminAccess, getBookingStats, generateBookingCSV, downloadCSV, getAllBookings, type BookingStats } from '@/lib/admin-data'
import jsPDF from 'jspdf'

export default function Reports() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<BookingStats | null>(null)
    const [reportPeriod, setReportPeriod] = useState('all')

    useEffect(() => {
        checkAccess()
    }, [])

    const checkAccess = async () => {
        const hasAccess = await checkAdminAccess()
        if (!hasAccess) {
            router.push('/login')
            return
        }
        loadData()
    }

    const loadData = async () => {
        // Load All Time stats for summary
        const data = await getBookingStats()
        setStats(data)
        setLoading(false)
    }

    const handleDownloadCSV = async () => {
        const bookings = await getAllBookings()
        const csv = generateBookingCSV(bookings)
        downloadCSV(csv, `Full_Report_${new Date().toISOString().split('T')[0]}.csv`)
    }

    const handleDownloadPDF = async () => {
        const doc = new jsPDF()
        const today = new Date().toLocaleDateString()

        doc.setFontSize(22)
        doc.text("A&H Futsal - Management Report", 20, 20)

        doc.setFontSize(12)
        doc.text(`Generated on: ${today}`, 20, 30)

        doc.setLineWidth(0.5)
        doc.line(20, 35, 190, 35)

        // Summary Stats
        doc.setFontSize(16)
        doc.text("Executive Summary", 20, 50)

        doc.setFontSize(12)
        let y = 60
        const addLine = (label: string, value: string) => {
            doc.text(`${label}:`, 20, y)
            doc.text(value, 120, y)
            y += 10
        }

        addLine("Total Revenue", `LKR ${stats?.total_income?.toLocaleString() || 0}`)
        addLine("Total Bookings", (stats?.total_bookings || 0).toString())
        addLine("Confirmed Bookings", (stats?.confirmed_bookings || 0).toString())
        addLine("Completed Bookings", (stats?.completed_bookings || 0).toString())
        addLine("Cancelled Bookings", (stats?.cancelled_bookings || 0).toString())

        // Footer
        doc.setFontSize(10)
        doc.text("Confidential - Internal Use Only", 20, 280)

        doc.save(`AH_Futsal_Report_${today.replace(/\//g, '-')}.pdf`)
    }

    if (loading) {
        return <div className="p-8 text-center">Loading reports...</div>
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.push('/admin')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Reports Center</h1>
                        <p className="text-muted-foreground">Export data and generate insights</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CSV Export Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                Data Export (CSV)
                            </CardTitle>
                            <CardDescription>
                                Download raw booking data for Excel or Google Sheets.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted rounded-md mb-4 text-sm">
                                Includes all booking fields: Customer details, payments, statuses, and notes.
                            </div>
                            <Button className="w-full" onClick={handleDownloadCSV}>
                                <Download className="h-4 w-4 mr-2" />
                                Download CSV Report
                            </Button>
                        </CardContent>
                    </Card>

                    {/* PDF Summary Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-blue-600" />
                                Summary Report (PDF)
                            </CardTitle>
                            <CardDescription>
                                Generate a printable executive summary of performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted rounded-md mb-4 text-sm">
                                Includes key metrics: Total income, booking counts, and operational stats.
                            </div>
                            <Button className="w-full" variant="outline" onClick={handleDownloadPDF}>
                                <Download className="h-4 w-4 mr-2" />
                                Generate PDF Summary
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
