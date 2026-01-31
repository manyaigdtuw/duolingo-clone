const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    console.log('🔄 Starting migration...');

    try {
        const sqlPath = path.join(__dirname, 'db', 'migrations', 'add_fill_in_blank.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 Executing SQL migration...');
        await pool.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Restart your dev server (npm run dev)');
        console.log('2. Go to /admin to create FILL_IN_BLANK challenges');
        console.log('3. Add correct answers via "Fill-in-Blank Answers" menu');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('');
        console.error('Troubleshooting:');
        console.error('- Make sure your DATABASE_URL in .env is correct');
        console.error('- Ensure PostgreSQL is running');
        console.error('- Check if you have permission to modify the database');
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
