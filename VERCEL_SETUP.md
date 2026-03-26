# 🚀 Vercel Deployment - Quick Fix Guide

## ❌ Error: Authentication Failed / 500 Error

If you see this error on Vercel, it means **Environment Variables are missing**.

## ✅ Fix in 3 Steps:

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Select your project: `amb-check`
3. Click: **Settings** → **Environment Variables**

### Step 2: Add Required Variables

Click **"Add New"** and add these **2 REQUIRED** variables:

#### Variable 1: NEXTAUTH_SECRET
- **Key:** `NEXTAUTH_SECRET`
- **Value:** `kXstwSNbBs+rNh+mGdW5tXPX8Pvuw/HK5uDSPJmBGDY=`
- **Environments:** Check ✅ **Production**, **Preview**, **Development** (all 3)
- Click **Save**

#### Variable 2: NEXTAUTH_URL
- **Key:** `NEXTAUTH_URL`
- **Value:** Your Vercel URL (e.g., `https://amb-check-zg4p-old5h9n3f-tchaijits-projects.vercel.app`)
- **Environments:** Check ✅ **Production**, **Preview**, **Development** (all 3)
- Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **⋮** (3 dots) on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for build to complete

## 🎉 Done!

Your app should work now. Refresh the page after deployment completes.

---

## 🔒 Optional: Add Database (Supabase)

If you want to use real database instead of mock data:

Add these additional variables in the same way:

```
POSTGRES_URL=<your-postgres-url>
POSTGRES_PRISMA_URL=<your-postgres-prisma-url>
POSTGRES_URL_NON_POOLING=<your-postgres-non-pooling-url>
POSTGRES_USER=postgres
POSTGRES_HOST=<your-supabase-host>
POSTGRES_PASSWORD=<your-password>
POSTGRES_DATABASE=postgres
```

Then **Redeploy** again.

---

## 🧪 Test Accounts

All passwords: `password123`

- **Driver**: driver@hospital.com
- **Equipment**: equipment@hospital.com
- **Nurse**: nurse@hospital.com
- **HOD**: hod@hospital.com

---

## ❓ Still Having Issues?

Check Vercel build logs:
1. Go to **Deployments**
2. Click on the latest deployment
3. Click **"View Function Logs"**
4. Look for errors in red
