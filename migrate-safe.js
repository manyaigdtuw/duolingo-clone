const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runSafeMigration() {
    console.log('🔄 Starting SAFE migration...');
    console.log('This migration will preserve all existing data.\n');

    try {
        const sqlPath = path.join(__dirname, 'db', 'migrations', 'add_fill_in_blank_safe.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 Executing SQL migration...');
        const result = await pool.query(sql);

        // Show any notices from the migration
        if (result && result.rows) {
            result.rows.forEach(row => console.log(row));
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('');
        console.log('🔍 Verifying migration...');

        // Verify the enum type
        const enumCheck = await pool.query(`
      SELECT enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'challenges_type'
      ORDER BY e.enumsortorder;
    `);

        console.log('   Enum values:', enumCheck.rows.map(r => r.enumlabel).join(', '));

        // Verify the table
        const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'challenge_correct_answers'
      ) as exists;
    `);

        console.log('   challenge_correct_answers table exists:', tableCheck.rows[0].exists);

        // Check challenges table has type column
        const columnCheck = await pool.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'challenges' AND column_name = 'type';
    `);

        if (columnCheck.rows.length > 0) {
            console.log('   ✅ challenges.type column exists with type:', columnCheck.rows[0].udt_name);
        } else {
            console.log('   ❌ challenges.type column NOT FOUND!');
        }

        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Restart your dev server (Ctrl+C then npm run dev)');
        console.log('2. Go to /admin to create FILL_IN_BLANK challenges');
        console.log('3. Add correct answers via "Fill-in-Blank Answers" menu');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('');
        console.error('Error details:', error);
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

runSafeMigration();
