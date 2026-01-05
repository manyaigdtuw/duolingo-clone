import { cache } from "react";

import { auth } from "@clerk/nextjs/server";

import db from "./index";

const DAY_IN_MS = 86_400_000;

export const getCourses = cache(async () => {
  const { rows } = await db.query("SELECT * FROM courses");
  return rows.map((course) => ({
    ...course,
    imageSrc: course.image_src,
  }));
});

export const getUserProgress = cache(async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const { rows } = await db.query(
    `
    SELECT
      up.*,
      c.title as active_course_title,
      c.image_src as active_course_image_src
    FROM user_progress up
    LEFT JOIN courses c ON up.active_course_id = c.id
    WHERE up.user_id = $1
  `,
    [userId]
  );

  const data = rows[0];

  if (!data) return null;

  return {
    userId: data.user_id,
    userName: data.user_name,
    userImageSrc: data.user_image_src,
    activeCourseId: data.active_course_id,
    hearts: data.hearts,
    points: data.points,
    activeCourse: data.active_course_id
      ? {
          id: data.active_course_id,
          title: data.active_course_title,
          imageSrc: data.active_course_image_src,
        }
      : null,
  };
});

export const getUnits = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) return [];

  // Fetch units
  const { rows: units } = await db.query(
    `
    SELECT * FROM units
    WHERE course_id = $1
    ORDER BY "order" ASC
  `,
    [userProgress.activeCourseId]
  );

  const normalizedUnits = [];

  for (const unit of units) {
    // Fetch lessons for each unit
    const { rows: lessons } = await db.query(
      `
      SELECT * FROM lessons
      WHERE unit_id = $1
      ORDER BY "order" ASC
    `,
      [unit.id]
    );

    const normalizedLessons = [];

    for (const lesson of lessons) {
      // Fetch challenges for each lesson
      const { rows: challenges } = await db.query(
        `
        SELECT * FROM challenges
        WHERE lesson_id = $1
        ORDER BY "order" ASC
      `,
        [lesson.id]
      );

      const normalizedChallenges = [];

      for (const challenge of challenges) {
        // Check challenge progress
        const { rows: challengeProgress } = await db.query(
          `
          SELECT * FROM challenge_progress
          WHERE challenge_id = $1 AND user_id = $2
        `,
          [challenge.id, userId]
        );

        normalizedChallenges.push({
          ...challenge,
          challengeProgress: challengeProgress.length > 0 ? challengeProgress : null,
        });
      }

      const allCompletedChallenges =
        normalizedChallenges.length > 0 &&
        normalizedChallenges.every((challenge) => {
          return (
            challenge.challengeProgress &&
            challenge.challengeProgress.length > 0 &&
            challenge.challengeProgress.every((progress) => progress.completed)
          );
        });

      normalizedLessons.push({
        ...lesson,
        unitId: lesson.unit_id,
        challenges: normalizedChallenges,
        completed: allCompletedChallenges,
      });
    }

    normalizedUnits.push({
      ...unit,
      courseId: unit.course_id,
      lessons: normalizedLessons,
    });
  }

  return normalizedUnits;
});

export const getCourseById = cache(async (courseId) => {
  const { rows: courses } = await db.query(
    "SELECT * FROM courses WHERE id = $1",
    [courseId]
  );
  const course = courses[0];

  if (!course) return null;

  return {
    ...course,
    imageSrc: course.image_src,
  };
});

export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) return null;

  const units = await getUnits(); // Uses normalized structure from above

  const firstUncompletedLesson = units
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return !lesson.completed;
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id) => {
  const { userId } = await auth();

  if (!userId) return null;

  const courseProgress = await getCourseProgress();
  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) return null;

  const { rows: lessons } = await db.query(
    "SELECT * FROM lessons WHERE id = $1",
    [lessonId]
  );
  const data = lessons[0];

  if (!data) return null;

  const { rows: challenges } = await db.query(
    `
    SELECT * FROM challenges
    WHERE lesson_id = $1
    ORDER BY "order" ASC
  `,
    [lessonId]
  );

  const normalizedChallenges = [];

  for (const challenge of challenges) {
    const { rows: options } = await db.query(
      "SELECT * FROM challenge_options WHERE challenge_id = $1",
      [challenge.id]
    );

    const normalizedOptions = options.map((opt) => ({
      ...opt,
      challengeId: opt.challenge_id,
      imageSrc: opt.image_src,
      audioSrc: opt.audio_src,
    }));

    const { rows: progress } = await db.query(
      "SELECT * FROM challenge_progress WHERE challenge_id = $1 AND user_id = $2",
      [challenge.id, userId]
    );

    const completed =
      progress.length > 0 && progress.every((p) => p.completed);

    normalizedChallenges.push({
      ...challenge,
      lessonId: challenge.lesson_id,
      challengeOptions: normalizedOptions,
      completed,
    });
  }

  return { ...data, unitId: data.unit_id, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) return 0;

  const lesson = await getLesson(courseProgress?.activeLessonId);

  if (!lesson) return 0;

  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );

  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );

  return percentage;
});

export const getUserSubscription = cache(async () => {
  // Always return active subscription to unlock all features
  return {
    isActive: true,
  };
});

export const getTopTenUsers = cache(async () => {
  const { userId } = await auth();

  if (!userId) return [];

  const { rows } = await db.query(
    `
    SELECT user_id, user_name, user_image_src, points
    FROM user_progress
    ORDER BY points DESC
    LIMIT 10
  `
  );

  return rows.map((row) => ({
    userId: row.user_id,
    userName: row.user_name,
    userImageSrc: row.user_image_src,
    points: row.points,
  }));
});
