# Supabase Setup Guide

This guide will help you set up Supabase for shared data storage so your entire team can see the same sprints and tasks.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: my-progress (or any name you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your team
5. Click "Create new project" (takes 1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 4: Configure Environment Variables

### For Local Development:

1. Create a file named `.env.local` in the project root
2. Add these lines:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Replace the values with your actual Supabase credentials

### For Netlify/Vercel Deployment:

1. Go to your deployment platform (Netlify/Vercel)
2. Navigate to **Site Settings** → **Environment Variables**
3. Add these two variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Redeploy your site

## Step 5: Install Dependencies

Run this command in your project directory:
```bash
npm install
```

This will install `@supabase/supabase-js` which is already added to `package.json`.

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Create a sprint and add some tasks
3. Open the same URL in another browser/device
4. You should see the same data! 🎉

## How It Works

- **Without Supabase**: Data is stored in each user's browser (localStorage) - not shared
- **With Supabase**: Data is stored in a shared database - everyone sees the same data
- **Real-time Updates**: Changes made by one user appear instantly for all other users
- **Fallback**: If Supabase is not configured, the app falls back to localStorage

## Troubleshooting

### "Supabase credentials not found" warning
- Make sure `.env.local` exists and has the correct variable names
- Restart your dev server after adding environment variables
- For production, ensure environment variables are set in your deployment platform

### Real-time updates not working
- Check that you ran the SQL schema (especially the real-time publication lines)
- Verify your Supabase project has real-time enabled (it's on by default)

### Data not syncing
- Check browser console for errors
- Verify your Supabase project is active (not paused)
- Make sure RLS policies are set correctly (the schema includes public access policies)

## Security Note

The current setup allows public read/write access. For production with sensitive data, consider:
- Adding Supabase Authentication
- Restricting RLS policies based on user roles
- Using service role key for server-side operations (never expose this in client code!)

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

