"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, User, Shield, ShieldAlert } from 'lucide-react'
import { checkAdminAccess, getAllUsers, updateUserRole, type UserRoleData, type UserRole } from '@/lib/admin-data'

export default function UserManagement() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<UserRoleData[]>([])
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        checkAccess()
    }, [])

    const checkAccess = async () => {
        const hasAccess = await checkAdminAccess()
        if (!hasAccess) {
            router.push('/login')
            return
        }
        loadUsers()
    }

    const loadUsers = async () => {
        const data = await getAllUsers()
        setUsers(data)
        setLoading(false)
    }

    const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return

        setUpdating(userId)
        const success = await updateUserRole(userId, newRole)

        if (success) {
            setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u))
            alert('User role updated successfully')
        } else {
            alert('Failed to update user role')
        }
        setUpdating(null)
    }

    if (loading) {
        return <div className="p-8 text-center">Loading users...</div>
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.push('/admin')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold">User Management</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Registered Users & Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="hidden sm:table-cell">User ID</TableHead>
                                        <TableHead>Current Role</TableHead>
                                        <TableHead className="hidden sm:table-cell">Joined Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell">
                                                {user.user_id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {user.role === 'super_admin' && <ShieldAlert className="h-4 w-4 text-red-500" />}
                                                    {user.role === 'moderator' && <Shield className="h-4 w-4 text-blue-500" />}
                                                    {user.role === 'user' && <User className="h-4 w-4 text-gray-500" />}
                                                    <span className="capitalize">{user.role.replace('_', ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Select
                                                    disabled={updating === user.user_id}
                                                    value={user.role}
                                                    onValueChange={(val) => handleRoleUpdate(user.user_id, val as UserRole)}
                                                >
                                                    <SelectTrigger className="w-[140px] ml-auto">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="user">User</SelectItem>
                                                        <SelectItem value="moderator">Moderator</SelectItem>
                                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
