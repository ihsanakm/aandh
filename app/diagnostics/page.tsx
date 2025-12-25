"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export default function DiagnosticsPage() {
    const [status, setStatus] = useState<{
        envVars: boolean
        connection: boolean
        tablesExist: boolean
        error?: string
    }>({
        envVars: false,
        connection: false,
        tablesExist: false
    })

    useEffect(() => {
        async function checkStatus() {
            // Check environment variables
            const hasEnvVars = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

            try {
                // Try to query the bookings table
                const { data, error } = await supabase
                    .from('bookings')
                    .select('id')
                    .limit(1)

                if (error) {
                    console.error('Supabase error:', error)
                    setStatus({
                        envVars: hasEnvVars,
                        connection: true,
                        tablesExist: false,
                        error: error.message
                    })
                } else {
                    setStatus({
                        envVars: hasEnvVars,
                        connection: true,
                        tablesExist: true
                    })
                }
            } catch (err) {
                console.error('Connection error:', err)
                setStatus({
                    envVars: hasEnvVars,
                    connection: false,
                    tablesExist: false,
                    error: err instanceof Error ? err.message : 'Unknown error'
                })
            }
        }

        checkStatus()
    }, [])

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Supabase Diagnostics</h1>

            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {status.envVars ? (
                                <CheckCircle2 className="text-green-500" />
                            ) : (
                                <XCircle className="text-red-500" />
                            )}
                            Environment Variables
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {status.envVars ? (
                            <p className="text-green-600">✓ Environment variables are configured</p>
                        ) : (
                            <p className="text-red-600">✗ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {status.connection ? (
                                <CheckCircle2 className="text-green-500" />
                            ) : (
                                <XCircle className="text-red-500" />
                            )}
                            Supabase Connection
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {status.connection ? (
                            <p className="text-green-600">✓ Successfully connected to Supabase</p>
                        ) : (
                            <div>
                                <p className="text-red-600">✗ Cannot connect to Supabase</p>
                                {status.error && (
                                    <p className="text-sm text-muted-foreground mt-2">Error: {status.error}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {status.tablesExist ? (
                                <CheckCircle2 className="text-green-500" />
                            ) : status.connection ? (
                                <AlertCircle className="text-yellow-500" />
                            ) : (
                                <XCircle className="text-red-500" />
                            )}
                            Database Tables
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {status.tablesExist ? (
                            <p className="text-green-600">✓ Database tables exist and are accessible</p>
                        ) : status.connection ? (
                            <div>
                                <p className="text-yellow-600">⚠ Tables not found or not accessible</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Please run the schema.sql file in your Supabase SQL Editor
                                </p>
                                {status.error && (
                                    <p className="text-sm text-muted-foreground mt-2">Error: {status.error}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-red-600">✗ Cannot check tables (no connection)</p>
                        )}
                    </CardContent>
                </Card>

                {status.error && (
                    <Card className="border-yellow-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-600">
                                <AlertCircle />
                                Error Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                                {status.error}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-blue-50 dark:bg-blue-950">
                    <CardHeader>
                        <CardTitle>Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p>1. Make sure your Supabase project is active</p>
                        <p>2. Run the schema.sql file in Supabase SQL Editor</p>
                        <p>3. Refresh this page to verify the setup</p>
                        <p className="mt-4">
                            <a
                                href="https://gokmimpspoxiybosszot.supabase.co"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                → Open Supabase Dashboard
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
