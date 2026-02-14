import "dotenv/config";
import db from "../db/index.js";

const main = async () => {
  try {
    console.log("Seeding database");

    // Delete all existing data
    await db.query("DELETE FROM user_progress");
    await db.query("DELETE FROM challenges");
    await db.query("DELETE FROM units");
    await db.query("DELETE FROM lessons");
    await db.query("DELETE FROM courses");
    await db.query("DELETE FROM challenge_options");

    // Insert courses
    const { rows: courses } = await db.query(
      "INSERT INTO courses (title, image_src) VALUES ($1, $2) RETURNING *",
      ["Spanish", "/es.svg"]
    );

    // For each course, insert units
    for (const course of courses) {
      const { rows: units } = await db.query(
        `INSERT INTO units (course_id, title, description, "order") VALUES ($1, $2, $3, $4), ($1, $5, $6, $7) RETURNING *`,
        [
          course.id,
          "Unit 1",
          `Learn the basics of ${course.title}`,
          1,
          "Unit 2",
          `Learn intermediate ${course.title}`,
          2,
        ]
      );

      // For each unit, insert lessons
      for (const unit of units) {
        const { rows: lessons } = await db.query(
          `INSERT INTO lessons (unit_id, title, "order") VALUES
          ($1, 'Nouns', 1),
          ($1, 'Verbs', 2),
          ($1, 'Adjectives', 3),
          ($1, 'Phrases', 4),
          ($1, 'Sentences', 5)
          RETURNING *`,
          [unit.id]
        );

        // For each lesson, insert challenges
        for (const lesson of lessons) {
          const { rows: challenges } = await db.query(
            `INSERT INTO challenges (lesson_id, type, question, "order") VALUES
            ($1, 'SELECT', 'Which one of these is "the man"?', 1),
            ($1, 'SELECT', 'Which one of these is "the woman"?', 2),
            ($1, 'SELECT', 'Which one of these is "the boy"?', 3),
            ($1, 'ASSIST', '"the man"', 4),
            ($1, 'SELECT', 'Which one of these is "the zombie"?', 5),
            ($1, 'SELECT', 'Which one of these is "the robot"?', 6),
            ($1, 'SELECT', 'Which one of these is "the girl"?', 7),
            ($1, 'ASSIST', '"the zombie"', 8)
            RETURNING *`,
            [lesson.id]
          );

          // For each challenge, insert challenge options
          for (const challenge of challenges) {
            if (challenge.order === 1) {
              await db.query(
                `INSERT INTO challenge_options (challenge_id, correct, text, image_src, audio_src) VALUES
                ($1, true, 'el hombre', '/man.svg', '/es_man.mp3'),
                ($1, false, 'la mujer', '/woman.svg', '/es_woman.mp3'),
                ($1, false, 'el chico', '/boy.svg', '/es_boy.mp3')`,
                [challenge.id]
              );
            }

            if (challenge.order === 2) {
              await db.query(
                `INSERT INTO challenge_options (challenge_id, correct, text, image_src, audio_src) VALUES
                ($1, true, 'la mujer', '/woman.svg', '/es_woman.mp3'),
                ($1, false, 'el chico', '/boy.svg', '/es_boy.mp3'),
                ($1, false, 'el hombre', '/man.svg', '/es_man.mp3')`,
                [challenge.id]
              );
            }

            if (challenge.order === 3) {
              await db.query(
                `INSERT INTO challenge_options (challenge_id, correct, text, image_src, audio_src) VALUES
                ($1, false, 'la mujer', '/woman.svg', '/es_woman.mp3'),
                ($1, false, 'el hombre', '/man.svg', '/es_man.mp3'),
                ($1, true, 'el chico', '/boy.svg', '/es_boy.mp3')`,
                [challenge.id]
              );
            }

            if (challenge.order === 4) {
              await db.query(
                `INSERT INTO challenge_options (challenge_id, correct, text, audio_src) VALUES
                ($1, false, 'la mujer', '/es_woman.mp3'),
                ($1, true, 'el hombre', '/es_man.mp3'),
                ($1, false, 'el chico', '/es_boy.mp3')`,
                [challenge.id]
              );
            }

            if (challenge.order === 5) {
              await db.query(
                `INSERT INTO challenge_options (challenge_id, correct, text, image_src, audio_src) VALUES
                ($1, false, 'el hombre', '/man.svg', '/es_man.mp3'),
                ($1, false, 'la mujer', '/woman.svg', '/es_woman.mp3'),
                ($1, true, 'el zombie', '/zombie.svg', '/es_zombie.mp3')`,
                [challenge.id]
              );
            }

            if (challenge.order === 6) {
              await db.query(
                `INSERT INTO challenge_options (challenge_id, correct, text, image_src, audio_src) VALUES
                ($1, true, 'el robot', '/robot.svg', '/es_robot.mp3'),
                ($1, false, 'el zombie', '/zombie.svg', '/es_zombie.mp3'),
                ($1, false, 'el chico', '/boy.svg', '/es_boy.mp3')`,
                [challenge.id]
              );
            }

            if (challenge.order === 7) {
              await db.query(
                `INSERT INTO challenge_options (challenge_id, correct, text, image_src, audio_src) VALUES
                ($1, true, 'la nina', '/girl.svg', '/es_girl.mp3'),
                ($1, false, 'el zombie', '/zombie.svg', '/es_zombie.mp3'),
                ($1, false, 'el hombre', '/man.svg', '/es_man.mp3')`,
                [challenge.id]
              );
            }

            if (challenge.order === 8) {
              await db.query(
                `INSERT INTO challenge_options (challenge_id, correct, text, audio_src) VALUES
                ($1, false, 'la mujer', '/es_woman.mp3'),
                ($1, true, 'el zombie', '/es_zombie.mp3'),
                ($1, false, 'el chico', '/es_boy.mp3')`,
                [challenge.id]
              );
            }
          }
        }
      }
    }
    console.log("Database seeded successfully");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed database");
  }
};

void main();
