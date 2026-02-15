# Deployment Guide

## 1. Supabase Setup (Database)

1.  **Login to Supabase**: Go to [supabase.com](https://supabase.com) and sign in.
2.  **Select Project**: Open the project associated with your existing `.env.local` URL (`https://gokmimpspoxiybosszot.supabase.co`).
3.  **SQL Editor**:
    *   In the sidebar, click on the **SQL Editor** icon (looks like a terminal `>_`).
    *   Click "New Query".
4.  **Run Schema**:
    *   Open the file `supabase/schema.sql` in this project properly.
    *   Copy the **entire content** of `supabase/schema.sql`.
    *   Paste it into the Supabase SQL Editor.
    *   Click **Run** (bottom right).
5.  **Fix User Roles**:
    *   If you have already signed up in the app, your user might have the default 'user' role.
    *   To make yourself an admin, run this SQL query in Supabase (replace with your email):
        ```sql
        UPDATE public.user_roles 
        SET role = 'super_admin' 
        WHERE email = 'your_email@example.com';
        ```

## 2. Vercel Deployment (Hosting)

1.  **Push Code to GitHub**:
    *   Ensure your latest code is pushed to your GitHub repository.
    *   Commits should include the recent fixes.

2.  **Login to Vercel**:
    *   Go to [vercel.com](https://vercel.com).
    *   Login with your GitHub account.

3.  **Import Project**:
    *   Click "Add New..." -> "Project".
    *   Find your repository (`aandh` or similar) and click **Import**.

4.  **Configure Project**:
    *   **Framework**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Environment Variables**:
        *   Copy the contents of your `.env.local` file.
        *   Paste them into the Environment Variables section in Vercel.
        *   Keys needed:
            *   `NEXT_PUBLIC_SUPABASE_URL`
            *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5.  **Deploy**:
    *   Click **Deploy**.
    *   Wait for the build to finish. It should take about a minute.

## 3. Verification

*   Once deployed, Vercel will give you a domain (e.g., `aandh.vercel.app`).
*   Open the live site.
*   Test booking a slot (public).
*   Go to `/admin`, login, and check the dashboard.
