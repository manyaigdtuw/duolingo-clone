import "dotenv/config";
import fs from "fs";
import { parse } from "csv-parse";
import db from "../db/index.js";

const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error("Please provide the path to the CSV file as an argument.");
  process.exit(1);
}

const processFile = async () => {
  const records = [];
  const parser = fs.createReadStream(csvFilePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }

  return records;
};

const importData = async () => {
  try {
    const records = await processFile();

    console.log(`Found ${records.length} records to import.`);

    for (const record of records) {
      const { lessonid, type, order, question, correct_answer, hint } = record;

      if (type !== "FILL_IN") {
        console.warn(`Skipping unsupported type: ${type}`);
        continue;
      }

      // 1. Create Challenge with hint
      const { rows: challengeRows } = await db.query(
        `INSERT INTO challenges (lesson_id, type, question, "order", hint)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [lessonid, type, question, order, hint || null]
      );

      const challengeId = challengeRows[0].id;

      // 2. Create Challenge Option (Correct Answer)
      await db.query(
        `INSERT INTO challenge_options (challenge_id, text, correct, audio_src)
         VALUES ($1, $2, $3, $4)`,
        [challengeId, correct_answer, true, null]
      );

      console.log(`Imported challenge: ${question}`);
    }

    console.log("Import completed.");
  } catch (error) {
    console.error("Error importing data:", error);
  }
};

importData();
