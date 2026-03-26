# Database Setup

## Vercel Postgres Setup

### 1. Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose a region close to your users
7. Click "Create"

### 2. Get Database Credentials

After creating the database:

1. Go to your database in Vercel Dashboard
2. Click on ".env.local" tab
3. Copy all the environment variables

### 3. Set Environment Variables

Create `.env.local` file in the project root:

```bash
# Copy from Vercel Dashboard
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

### 4. Run Database Migration

Connect to your Vercel Postgres database and run the schema:

**Option A: Using Vercel Dashboard**
1. Go to your database in Vercel Dashboard
2. Click "Query" tab
3. Copy content from `db/schema.sql`
4. Paste and execute

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Connect to database
vercel env pull .env.local

# Run migrations (you'll need to execute schema.sql manually)
```

**Option C: Using psql**
```bash
# Get connection string from .env.local
psql "your-postgres-url-here" -f db/schema.sql
```

### 5. Verify Setup

After running the schema, verify that tables are created:

```sql
-- List all tables
\dt

-- Check ambulances
SELECT * FROM ambulances;

-- Check users
SELECT * FROM users;
```

You should see 5 ambulances and 4 test users.

## Database Schema

### Tables

1. **users** - System users (driver, equipment_officer, nurse, hod)
2. **ambulances** - Ambulance vehicles
3. **inspections** - Daily inspection records
4. **inspection_items** - Individual checklist items for each inspection

### Relationships

```
ambulances (1) ──< (N) inspections
inspections (1) ──< (N) inspection_items
users (1) ──< (N) inspections (inspected_by, hod_approved_by)
users (1) ──< (N) inspection_items (inspected_by)
```

## Testing

The application will work without a database using mock data for development. To test with real database:

1. Set up environment variables
2. Run the schema
3. Restart the development server
4. Use the application normally

## Troubleshooting

### "Database not available" messages in console

This is normal if you haven't set up the database yet. The app will use mock data instead.

### Connection errors

1. Check your `.env.local` file exists
2. Verify environment variables are correct
3. Ensure database is accessible from your IP
4. Check Vercel Postgres dashboard for connection issues

### Tables not found

Run the schema.sql file again to create all tables.

## Production Deployment

When deploying to Vercel:

1. Environment variables are automatically available from the Vercel Dashboard
2. No need to commit `.env.local` file
3. Database connection will work automatically
4. Make sure to run schema.sql on your production database first

## Sample Data

The schema includes sample data:
- 5 ambulances (AMB-001 to AMB-005)
- 4 test users (one for each role)

You can modify or add more data as needed.
