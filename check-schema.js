const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
    console.log('🔍 Checking current database schema...\n');

    try {
        // Check if challenges table exists and its structure
        const tableCheck = await pool.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'challenges'
      ORDER BY ordinal_position;
    `);

        console.log('📋 Challenges table columns:');
        if (tableCheck.rows.length === 0) {
            console.log('❌ Table "challenges" does not exist!');
        } else {
            tableCheck.rows.forEach(row => {
                console.log(`  - ${row.column_name}: ${row.data_type} (${row.udt_name})`);
            });
        }

        console.log('\n');

        // Check enum type
        const enumCheck = await pool.query(`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'challenges_type'
      ORDER BY e.enumsortorder;
    `);

        console.log('🏷️  Enum "challenges_type" values:');
        if (enumCheck.rows.length === 0) {
            console.log('❌ Enum type "challenges_type" does not exist!');
        } else {
            enumCheck.rows.forEach(row => {
                console.log(`  - ${row.enumlabel}`);
            });
        }

        console.log('\n');

        // Check challenge_correct_answers table
        const correctAnswersCheck = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'challenge_correct_answers'
      ORDER BY ordinal_position;
    `);

        console.log('📋 Challenge_correct_answers table:');
        if (correctAnswersCheck.rows.length === 0) {
            console.log('❌ Table "challenge_correct_answers" does not exist!');
        } else {
            console.log('✅ Table exists with columns:');
            correctAnswersCheck.rows.forEach(row => {
                console.log(`  - ${row.column_name}: ${row.data_type}`);
            });
        }

    } catch (error) {
        console.error('❌ Error checking schema:', error.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
