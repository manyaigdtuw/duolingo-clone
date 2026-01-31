const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function importFillInBlankChallenges(csvFilePath) {
    console.log('🔄 Starting import of fill-in-blank challenges...\n');

    try {
        // Read CSV file
        const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

        // Parse CSV
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        console.log(`📋 Found ${records.length} challenges to import\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const record of records) {
            try {
                const {
                    lesson_id,
                    question,
                    order,
                    correct_answers, // Comma-separated list of correct answers
                    case_sensitive, // "true" or "false" (optional, defaults to false)
                } = record;

                // Validate required fields
                if (!lesson_id || !question || !order || !correct_answers) {
                    console.error(`❌ Skipping row - missing required fields:`, record);
                    errorCount++;
                    continue;
                }

                // Insert the challenge
                const { rows: challengeRows } = await pool.query(
                    `INSERT INTO challenges (lesson_id, type, question, "order")
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
                    [parseInt(lesson_id), 'FILL_IN_BLANK', question, parseInt(order)]
                );

                const challengeId = challengeRows[0].id;

                // Parse correct answers (split by comma or semicolon)
                const answers = correct_answers.split(/[,;]/).map(a => a.trim()).filter(a => a);

                // Determine case sensitivity
                const isCaseSensitive = case_sensitive?.toLowerCase() === 'true';

                // Insert correct answers
                for (const answer of answers) {
                    await pool.query(
                        `INSERT INTO challenge_correct_answers (challenge_id, answer, is_case_sensitive)
             VALUES ($1, $2, $3)`,
                        [challengeId, answer, isCaseSensitive]
                    );
                }

                console.log(`✅ Imported: "${question.substring(0, 50)}..." with ${answers.length} correct answer(s)`);
                successCount++;

            } catch (error) {
                console.error(`❌ Error importing row:`, record);
                console.error(`   Error: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 Import Summary:');
        console.log(`   ✅ Successfully imported: ${successCount}`);
        console.log(`   ❌ Failed: ${errorCount}`);
        console.log(`   📝 Total: ${records.length}`);

    } catch (error) {
        console.error('❌ Fatal error during import:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Get CSV file path from command line argument
const csvFilePath = process.argv[2] || './fill_in_blank_challenges.csv';

if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found: ${csvFilePath}`);
    console.log('\nUsage: node import-fill-in-blank.js <path-to-csv-file>');
    console.log('Example: node import-fill-in-blank.js ./fill_in_blank_challenges.csv');
    console.log('working till here.')
    process.exit(1);
}

importFillInBlankChallenges(csvFilePath);
