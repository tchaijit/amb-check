require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    console.log('🚀 Starting database migration...');
    console.log('📍 Database:', process.env.POSTGRES_HOST || 'Not configured');
    
    const sqlFile = path.join(__dirname, '..', 'db', 'schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Running SQL schema...\n');
    
    // Run the entire SQL file as one query
    await sql.query(sqlContent);
    
    console.log('\n✅ Migration completed successfully!\n');
    console.log('📊 Created tables:');
    console.log('  - users (4 test accounts)');
    console.log('  - ambulances (5 vehicles)');
    console.log('  - inspections');
    console.log('  - inspection_items\n');
    console.log('🔐 Test accounts (password: password123):');
    console.log('  - driver@hospital.com');
    console.log('  - equipment@hospital.com');
    console.log('  - nurse@hospital.com');
    console.log('  - hod@hospital.com\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

migrate();
