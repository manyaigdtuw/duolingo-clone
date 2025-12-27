"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { MAX_HEARTS } from "@/constants";
import db from "@/db/index";
import { getUserProgress, getUserSubscription } from "@/db/queries";

export const upsertChallengeProgress = async (challengeId) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized.");

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  if (!currentUserProgress) throw new Error("User progress not found.");

  const { rows: challenges } = await db.query(
    "SELECT * FROM challenges WHERE id = $1",
    [challengeId]
  );
  const challenge = challenges[0];

  if (!challenge) throw new Error("Challenge not found.");

  const lessonId = challenge.lesson_id;

  const { rows: existingChallengeProgress } = await db.query(
    `
    SELECT * FROM challenge_progress
    WHERE user_id = $1 AND challenge_id = $2
  `,
    [userId, challengeId]
  );

  const isPractice = !!existingChallengeProgress.length;

  if (
    currentUserProgress.hearts === 0 &&
    !isPractice &&
    !userSubscription?.isActive
  )
    return { error: "hearts" };

  if (isPractice) {
    await db.query(
      `
      UPDATE challenge_progress
      SET completed = true
      WHERE id = $1
    `,
      [existingChallengeProgress[0].id]
    );

    await db.query(
      `
      UPDATE user_progress
      SET hearts = LEAST(hearts + 1, $1), points = points + 10
      WHERE user_id = $2
    `,
      [MAX_HEARTS, userId]
    );

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  await db.query(
    `
    INSERT INTO challenge_progress (challenge_id, user_id, completed)
    VALUES ($1, $2, true)
  `,
    [challengeId, userId]
  );

  await db.query(
    `
    UPDATE user_progress
    SET points = points + 10
    WHERE user_id = $1
  `,
    [userId]
  );

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
