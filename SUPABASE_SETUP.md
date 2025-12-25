# Supabase Setup Instructions

## Issue: "Failed to fetch" Error

You're seeing this error because the application is trying to connect to Supabase, but the database tables haven't been created yet.

## Solution

### Step 1: Verify Supabase Connection

1. Go to your Supabase project: https://gokmimpspoxiybosszot.supabase.co
2. Make sure the project is **active** and not paused
3. Check that you can access the project dashboard

### Step 2: Create Database Tables

1. In your Supabase dashboard, navigate to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `schema.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run** to execute the SQL

This will create:
- `bookings` table with proper columns and indexes
- `payments` table for payment tracking
- Row Level Security (RLS) policies for data access

### Step 3: Verify Tables Were Created

1. Go to **Table Editor** in Supabase
2. You should see two tables:
   - `bookings`
   - `payments`

### Step 4: Test the Application

1. Refresh your browser at http://localhost:3000
2. Open the browser console (F12)
3. You should now see detailed error messages if there are any issues
4. The application should now work properly

## Enhanced Error Handling

I've added comprehensive error handling to help diagnose issues:

- **Detailed console logs** showing exactly what went wrong
- **Fallback mode** if tables don't exist (all slots shown as available)
- **Clear error messages** for common issues like:
  - Missing database tables
  - Network connectivity problems
  - Invalid Supabase credentials

## Checking Console Logs

Open your browser console (F12) and look for:

### If tables don't exist:
```
⚠️ Database table 'bookings' not found. Running in fallback mode with all slots available.
Please run the schema.sql file in your Supabase SQL Editor to create the required tables.
```

### If there's a network issue:
```
Network or unexpected error in getSlots: [error details]
This might indicate a network issue or CORS problem with Supabase.
Please check:
1. Your internet connection
2. Supabase project URL is correct
3. Supabase project is active and not paused
```

## Next Steps

After setting up the database:
1. The booking widget should work properly
2. You can create bookings and they'll be saved to Supabase
3. Slot availability will be checked in real-time
4. All bookings will persist across page refreshes
