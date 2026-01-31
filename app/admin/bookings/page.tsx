"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
    ArrowLeft,
    Search,
    Edit,
    Trash2,
    Download,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react'
import {
    checkAdminAccess,
    getAllBookings,
    updateBooking,
    cancelBooking,
    deleteBooking,
    getCurrentUserRole,
    generateBookingCSV,
    downloadCSV,
    type AdminBooking,
    type BookingStatus,
    type PaymentStatus,
    type PaymentMethod
} from '@/lib/admin-data'
import { formatTime12h } from '@/lib/data'
import jsPDF from 'jspdf'

export default function BookingsManagement() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [bookings, setBookings] = useState<AdminBooking[]>([])
    const [filteredBookings, setFilteredBookings] = useState<AdminBooking[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')
    const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [userRole, setUserRole] = useState<string | null>(null)

    // Edit form state
    const [editForm, setEditForm] = useState({
        status: '' as BookingStatus,
        payment_status: '' as PaymentStatus,
        payment_method: '' as PaymentMethod | undefined,
        price_lkr: 0,
        notes: ''
    })

    useEffect(() => {
        checkAccess()
    }, [])

    useEffect(() => {
        filterBookings()
    }, [bookings, searchTerm, statusFilter, paymentFilter])

    const checkAccess = async () => {
        const hasAccess = await checkAdminAccess()
        if (!hasAccess) {
            router.push('/')
            return
        }
        const role = await getCurrentUserRole()
        setUserRole(role)
        loadBookings()
        setLoading(false)
    }

    const loadBookings = async () => {
        const data = await getAllBookings()
        setBookings(data)
    }

    const filterBookings = () => {
        let filtered = bookings

        if (searchTerm) {
            filtered = filtered.filter(b =>
                b.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.user_mobile.includes(searchTerm) ||
                b.id.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => b.status === statusFilter)
        }

        if (paymentFilter !== 'all') {
            filtered = filtered.filter(b => b.payment_status === paymentFilter)
        }

        setFilteredBookings(filtered)
    }

    const handleEdit = (booking: AdminBooking) => {
        setSelectedBooking(booking)
        setEditForm({
            status: booking.status,
            payment_status: booking.payment_status,
            payment_method: booking.payment_method,
            price_lkr: booking.price_lkr,
            notes: booking.notes || ''
        })
        setEditDialogOpen(true)
    }

    const handleSaveEdit = async () => {
        if (!selectedBooking) return

        const success = await updateBooking(selectedBooking.id, editForm)
        if (success) {
            alert('Booking updated successfully!')
            setEditDialogOpen(false)
            loadBookings()
        } else {
            alert('Failed to update booking')
        }
    }

    const handleCancelBooking = async () => {
        if (!selectedBooking || !cancelReason) return

        const success = await cancelBooking(selectedBooking.id, cancelReason)
        if (success) {
            alert('Booking cancelled successfully!')
            setCancelDialogOpen(false)
            setCancelReason('')
            loadBookings()
        } else {
            alert('Failed to cancel booking')
        }
    }

    const handleDelete = async (booking: AdminBooking) => {
        if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
            return
        }

        const success = await deleteBooking(booking.id)
        if (success) {
            alert('Booking deleted successfully!')
            loadBookings()
        } else {
            alert('Failed to delete booking')
        }
    }

    const downloadReceipt = (booking: AdminBooking) => {
        const doc = new jsPDF()

        doc.setFontSize(20)
        doc.setFont("helvetica", "bold")
        doc.text("A&H FUTSAL", 105, 20, { align: "center" })

        doc.setFontSize(16)
        doc.text("BOOKING RECEIPT", 105, 30, { align: "center" })

        doc.setLineWidth(0.5)
        doc.line(20, 35, 190, 35)

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
        doc.text(new Date(booking.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }), 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Time:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(formatTime12h(booking.time_slot), 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Court:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(booking.court_id, 70, yPos)

        yPos += lineHeight * 2
        doc.setLineWidth(0.5)
        doc.line(20, yPos - 5, 190, yPos - 5)

        doc.setFont("helvetica", "bold")
        doc.text("Customer:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(booking.user_name, 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Mobile:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(booking.user_mobile, 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Status:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(booking.status.toUpperCase(), 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Payment:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(booking.payment_status.toUpperCase(), 70, yPos)

        yPos += lineHeight
        doc.setFont("helvetica", "bold")
        doc.text("Amount:", 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(`LKR ${booking.price_lkr.toLocaleString()}`, 70, yPos)

        yPos += lineHeight * 2
        doc.setLineWidth(0.5)
        doc.line(20, yPos - 5, 190, yPos - 5)

        doc.setFontSize(10)
        doc.setFont("helvetica", "italic")
        doc.text("Please show this receipt at the venue.", 105, yPos + 5, { align: "center" })

        doc.setFontSize(8)
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 15, { align: "center" })

        doc.save(`Receipt-${booking.id.substring(0, 8)}.pdf`)
    }

    const exportToCSV = () => {
        const csv = generateBookingCSV(filteredBookings)
        downloadCSV(csv, `bookings-${new Date().toISOString().split('T')[0]}.csv`)
    }

    const getStatusBadge = (status: BookingStatus) => {
        const variants: Record<BookingStatus, { variant: any; icon: any }> = {
            confirmed: { variant: 'default', icon: CheckCircle },
            cancelled: { variant: 'destructive', icon: XCircle },
            completed: { variant: 'secondary', icon: CheckCircle },
            no_show: { variant: 'outline', icon: XCircle }
        }
        const { variant, icon: Icon } = variants[status]
        return (
            <Badge variant={variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {status.replace('_', ' ')}
            </Badge>
        )
    }

    const getPaymentBadge = (status: PaymentStatus) => {
        const variants: Record<PaymentStatus, any> = {
            paid: 'default',
            unpaid: 'destructive',
            pending: 'secondary'
        }
        return <Badge variant={variants[status]}>{status}</Badge>
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Bookings</h1>
                        <p className="text-sm text-muted-foreground">{filteredBookings.length} bookings found</p>
                    </div>
                    <Button onClick={exportToCSV} size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, mobile, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="no_show">No Show</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payments</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings List - Mobile Cards / Desktop Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile View - Cards */}
                        <div className="md:hidden space-y-4">
                            {filteredBookings.map((booking) => (
                                <Card key={booking.id} className="border-white/10">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold">{booking.user_name}</p>
                                                <p className="text-sm text-muted-foreground">{booking.user_mobile}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => downloadReceipt(booking)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(booking)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {userRole === 'super_admin' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(booking)}
                                                        className="text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Date</p>
                                                <p className="font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Time</p>
                                                <p className="font-medium">{formatTime12h(booking.time_slot)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Price</p>
                                                <p className="font-medium">LKR {booking.price_lkr.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Status</p>
                                                <div className="mt-1">{getStatusBadge(booking.status)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                            <span className="text-sm text-muted-foreground">Payment</span>
                                            {getPaymentBadge(booking.payment_status)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {filteredBookings.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    No bookings found
                                </div>
                            )}
                        </div>

                        {/* Desktop View - Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Date</th>
                                        <th className="text-left p-2">Time</th>
                                        <th className="text-left p-2">Customer</th>
                                        <th className="text-left p-2">Mobile</th>
                                        <th className="text-left p-2">Price</th>
                                        <th className="text-left p-2">Status</th>
                                        <th className="text-left p-2">Payment</th>
                                        <th className="text-right p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                                            <td className="p-2">{new Date(booking.date).toLocaleDateString()}</td>
                                            <td className="p-2">{formatTime12h(booking.time_slot)}</td>
                                            <td className="p-2">{booking.user_name}</td>
                                            <td className="p-2">{booking.user_mobile}</td>
                                            <td className="p-2">LKR {booking.price_lkr.toLocaleString()}</td>
                                            <td className="p-2">{getStatusBadge(booking.status)}</td>
                                            <td className="p-2">{getPaymentBadge(booking.payment_status)}</td>
                                            <td className="p-2">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => downloadReceipt(booking)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(booking)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {userRole === 'super_admin' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDelete(booking)}
                                                            className="text-red-500"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredBookings.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    No bookings found
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Booking</DialogTitle>
                            <DialogDescription>
                                Update booking details for {selectedBooking?.user_name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={editForm.status}
                                    onValueChange={(value) => setEditForm({ ...editForm, status: value as BookingStatus })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Payment Status</label>
                                <Select
                                    value={editForm.payment_status}
                                    onValueChange={(value) => setEditForm({ ...editForm, payment_status: value as PaymentStatus })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select
                                    value={editForm.payment_method || ''}
                                    onValueChange={(value) => setEditForm({ ...editForm, payment_method: value as PaymentMethod })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Price (LKR)</label>
                                <Input
                                    type="number"
                                    value={editForm.price_lkr || 0}
                                    onChange={(e) => setEditForm({ ...editForm, price_lkr: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    placeholder="Add any notes..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveEdit}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
