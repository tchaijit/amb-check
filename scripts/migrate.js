require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const rawUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!rawUrl) {
    console.error('❌ POSTGRES_URL_NON_POOLING or POSTGRES_URL is not set in .env.local');
    process.exit(1);
  }

  const connectionString = rawUrl.replace(/[?&]sslmode=[^&]+/g, '').replace(/[?&]supa=[^&]+/g, '');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🚀 Starting database migration...');
    console.log('📍 Host:', process.env.POSTGRES_HOST || '(from URL)');

    await client.connect();
    console.log('✅ Connected\n');

    const sqlFile = path.join(__dirname, '..', 'db', 'schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 Running SQL schema...');
    await client.query(sqlContent);

    // Re-seed user password_hash via parameterized query
    // (bcrypt hash starts with `$2b$10$...` which pg's multi-statement parser
    // misinterprets as $2, $10 placeholders, leaving the field NULL)
    console.log('🔐 Setting user password hashes...');
    const PASSWORD_HASH = '$2b$10$K3ebqTbYMLcHYLBmO4mAxemSNiIm2SsCqzaXRJDFRz4/Og.WaRSaC';
    const SEED_USERS = [
      'driver@hospital.com',
      'equipment@hospital.com',
      'nurse@hospital.com',
      'hod@hospital.com',
    ];
    for (const email of SEED_USERS) {
      await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [
        PASSWORD_HASH,
        email,
      ]);
    }

    console.log('\n✅ Migration completed successfully!\n');
    console.log('📊 Tables ready: users, ambulances, inspections, inspection_items');
    console.log('🚑 Seeded: 5 ambulances, 4 test users');
    console.log('\n🔐 Test accounts (password: password123):');
    console.log('  - driver@hospital.com');
    console.log('  - equipment@hospital.com');
    console.log('  - nurse@hospital.com');
    console.log('  - hod@hospital.com\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code) console.error('Error code:', error.code);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

migrate();
