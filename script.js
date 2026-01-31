import fs from "fs";
import csv from "csv-parser";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --------------------------------------------------
// Normalize CSV rows (BOM + whitespace + case safe)
// --------------------------------------------------
function normalizeRow(row) {
  const clean = {};
  for (const key in row) {
    const normalizedKey = key
      .replace(/^\uFEFF/, "") // remove BOM
      .trim()
      .toLowerCase();

    clean[normalizedKey] = row[key]?.trim();
  }
  return clean;
}

// --------------------------------------------------
// Import function
// --------------------------------------------------
async function importQuestions(csvFilePath) {
  const client = await pool.connect();

  try {
    console.log("✅ DB connected");

    const rawRows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (data) => rawRows.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`📄 Loaded ${rawRows.length} rows`);

    if (rawRows.length === 0) {
      throw new Error("CSV file is empty");
    }

    // Normalize all rows once
    const rows = rawRows.map(normalizeRow);

    console.log("CSV HEADERS:", Object.keys(rows[0]));

    await client.query("BEGIN");

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // ------------------------------
      // Parse fields (MATCHING YOUR CSV)
      // ------------------------------
      const lessonId = parseInt(row.lessonid, 10);
      const order = parseInt(row.order, 10);
      const correctIndex = parseInt(row.correctoption, 10);
      const type = row.type?.toUpperCase();

      // ------------------------------
      // HARD VALIDATION (CLEAR ERRORS)
      // ------------------------------
      if (Number.isNaN(lessonId)) {
        throw new Error(
          `❌ Invalid lessonid at row ${i + 1}: ${row.lessonid}`
        );
      }

      if (Number.isNaN(order)) {
        throw new Error(
          `❌ Invalid order at row ${i + 1}: ${row.order}`
        );
      }

      if (![1, 2, 3].includes(correctIndex)) {
        throw new Error(
          `❌ Invalid correctoption at row ${i + 1}: ${row.correctoption}`
        );
      }

      if (!row.question || !row.option1 || !row.option2 || !row.option3) {
        throw new Error(`❌ Missing text fields at row ${i + 1}`);
      }

      console.log(
        `Processing row ${i + 1}: ${row.question.slice(0, 50)}...`
      );

      // ------------------------------
      // Insert challenge
      // ------------------------------
      const challengeRes = await client.query(
        `
        INSERT INTO challenges (lesson_id, type, question, "order")
        VALUES ($1, $2::challenges_type, $3, $4)
        RETURNING id
        `,
        [lessonId, type, row.question, order]
      );

      const challengeId = challengeRes.rows[0].id;

      // ------------------------------
      // Insert options
      // ------------------------------
      const options = [
        row.option1,
        row.option2,
        row.option3,
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
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

const csvFile = "ques.csv";

if (!fs.existsSync(csvFile)) {
  console.error(`❌ CSV file not found: ${csvFile}`);
  process.exit(1);
}

importQuestions(csvFile);
