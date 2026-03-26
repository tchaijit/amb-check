# 🚀 Deployment Guide / คู่มือการ Deploy

## Environment Variables / ตัวแปรสภาพแวดล้อม

### Required / จำเป็น

```bash
NEXTAUTH_SECRET=<your-secret-key>
NEXTAUTH_URL=https://your-domain.com
```

### Optional / ไม่บังคับ (ใช้ Mock Data ได้)

```bash
POSTGRES_URL=<postgres-connection-string>
POSTGRES_PRISMA_URL=<postgres-prisma-url>
POSTGRES_URL_NON_POOLING=<postgres-non-pooling-url>
POSTGRES_USER=<postgres-user>
POSTGRES_HOST=<postgres-host>
POSTGRES_PASSWORD=<postgres-password>
POSTGRES_DATABASE=<postgres-database>
```

---

## 🔐 Generate NEXTAUTH_SECRET

### Method 1: Using OpenSSL
```bash
openssl rand -base64 32
```

### Method 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📦 Deploy to Vercel

### Step 1: Connect Repository
1. Go to https://vercel.com/new
2. Import `tchaijit/amb-check` repository
3. Click "Import"

### Step 2: Configure Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

**Production & Preview:**
```
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://your-app.vercel.app
```

### Step 3: (Optional) Setup Database
If you want to use a real database instead of mock data:

1. Go to Vercel Dashboard → Storage → Create Database
2. Select "Postgres"
3. Copy the environment variables
4. Add them to Vercel → Settings → Environment Variables
5. Go to your database → Query tab
6. Run the SQL from `db/schema.sql`

### Step 4: Deploy
Click "Deploy" and wait for build to complete!

---

## 🏥 Test Accounts

All accounts use password: `password123`

- **Driver**: driver@hospital.com
- **Equipment Officer**: equipment@hospital.com  
- **Nurse**: nurse@hospital.com
- **HOD**: hod@hospital.com

---

## 🔧 Local Development

```bash
# Clone repository
git clone https://github.com/tchaijit/amb-check.git
cd amb-check

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local and add your NEXTAUTH_SECRET
# You can generate one using: openssl rand -base64 32

# Start development server
npm run dev
```

Open http://localhost:3000

---

## 📊 Features Available

✅ Works with Mock Data (no database required)  
✅ Authentication with NextAuth v5  
✅ Multi-role Inspection Workflow  
✅ QR Code Scanner & Generator  
✅ PDF Export  
✅ Statistics Dashboard  
✅ Inspection History  

---

## 🐛 Troubleshooting

### Issue: "Invalid Environment Variables"
- Make sure `NEXTAUTH_SECRET` is set
- Make sure `NEXTAUTH_URL` matches your domain

### Issue: "Database not available"
- This is normal! App works with mock data
- If you want real database, follow database setup steps above

### Issue: Authentication not working
- Check `NEXTAUTH_SECRET` is set correctly
- Clear cookies and try again
- Check `NEXTAUTH_URL` matches your domain (no trailing slash)

---

## 📞 Support

For issues, contact the development team or create an issue on GitHub.

---

Built with ❤️ for Bangkok Hospital
