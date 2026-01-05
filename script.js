import fs from "fs";
import csv from "csv-parser";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function importQuestions(csvFilePath) {
  const client = await pool.connect();

  try {
    console.log("✅ DB connected");

    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`📄 Loaded ${rows.length} rows`);

    await client.query("BEGIN");

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // ---- Parse CSV fields (MATCHING YOUR FORMAT) ----
      const lessonId = parseInt(row.lessonid?.trim(), 10);
      const order = parseInt(row.order?.trim(), 10);
      const correctIndex = parseInt(row.correct?.trim(), 10);
      const type = row.type?.trim().toUpperCase();

      // ---- HARD VALIDATION (NO SILENT FAILS) ----
      if (
        Number.isNaN(lessonId) ||
        Number.isNaN(order) ||
        ![1, 2, 3].includes(correctIndex)
      ) {
        throw new Error(
          `❌ Invalid numeric data at row ${i + 1}: ${JSON.stringify({
            lessonid: row.lessonid,
            order: row.order,
            correct: row.correct,
          })}`
        );
      }

      if (!row.question || !row.option1 || !row.option2 || !row.option3) {
        throw new Error(
          `❌ Missing text fields at row ${i + 1}`
        );
      }

      console.log(`Processing row ${i + 1}: ${row.question.slice(0, 40)}...`);

      // ---- Insert challenge ----
      const challengeRes = await client.query(
        `
        INSERT INTO challenges (lesson_id, type, question, "order")
        VALUES ($1, $2::challenges_type, $3, $4)
        RETURNING id
        `,
        [lessonId, type, row.question, order]
      );

      const challengeId = challengeRes.rows[0].id;

      // ---- Insert options ----
      const options = [
        row.option1.trim(),
        row.option2.trim(),
        row.option3.trim(),
      ];

      for (let j = 0; j < options.length; j++) {
        await client.query(
          `
          INSERT INTO challenge_options
          (challenge_id, text, correct, image_src, audio_src)
          VALUES ($1, $2, $3, NULL, '')
          `,
          [challengeId, options[j], j + 1 === correctIndex]
        );
      }
    }

    await client.query("COMMIT");
    console.log("🎉 Import completed successfully");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Import failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

// ---- RUN ----
const csvFile = "new.csv";

if (!fs.existsSync(csvFile)) {
  console.error(`❌ CSV file not found: ${csvFile}`);
  process.exit(1);
}

importQuestions(csvFile)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
