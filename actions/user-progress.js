"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { MAX_HEARTS, POINTS_TO_REFILL } from "@/constants";
import db from "@/db/index";
import { getCourseById, getUserProgress } from "@/db/queries";

export const upsertUserProgress = async (courseId) => {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Unauthorized.");

  const course = await getCourseById(courseId);

  if (!course) throw new Error("Course not found.");

  if (!course.units.length || !course.units[0].lessons.length)
    throw new Error("Course is empty.");

  const existingUserProgress = await getUserProgress();

  if (existingUserProgress) {
    await db.query(
      `
      UPDATE user_progress
      SET active_course_id = $1, user_name = $2, user_image_src = $3
      WHERE user_id = $4
    `,
      [
        courseId,
        user.firstName || "User",
        user.imageUrl || "/mascot.svg",
        userId,
      ]
    );

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  await db.query(
    `
    INSERT INTO user_progress (user_id, active_course_id, user_name, user_image_src)
    VALUES ($1, $2, $3, $4)
  `,
    [
      userId,
      courseId,
      user.firstName || "User",
      user.imageUrl || "/mascot.svg",
    ]
  );

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId) => {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized.");

  // Since hearts are unlimited, always return success without reducing hearts
  return { success: true };
  
  // OLD LOGIC (commented out):
  // const currentUserProgress = await getUserProgress();

  // const { rows: challenges } = await db.query(
  //   "SELECT * FROM challenges WHERE id = $1",
  //   [challengeId]
  // );
  // const challenge = challenges[0];

  // if (!challenge) throw new Error("Challenge not found.");

  // const { rows: existingChallengeProgress } = await db.query(
  //   `
  //   SELECT * FROM challenge_progress
  //   WHERE user_id = $1 AND challenge_id = $2
  //   `,
  //   [userId, challengeId]
  // );

  // const isPractice = !!existingChallengeProgress.length;

  // if (isPractice) return { error: "practice" };

  // if (!currentUserProgress) throw new Error("User progress not found.");

  // // Always return subscription error to prevent heart reduction in UI
  // // and do NOT update the database
  // return { error: "subscription" };
};

export const refillHearts = async () => {
  // Since hearts are unlimited, this function is no longer needed
  // But we keep it to avoid breaking the UI
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) throw new Error("User progress not found.");
  
  // Always return success without actually refilling (hearts are already unlimited)
  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  return { success: true };
  
  // OLD LOGIC (commented out):
  // if (currentUserProgress.hearts === MAX_HEARTS)
  //   throw new Error("Hearts are already full.");
  // if (currentUserProgress.points < POINTS_TO_REFILL)
  //   throw new Error("Not enough points.");

  // await db.query(
  //   `
  //   UPDATE user_progress
  //   SET hearts = $1, points = points - $2
  //   WHERE user_id = $3
  //   `,
  //   [MAX_HEARTS, POINTS_TO_REFILL, currentUserProgress.userId]
  // );

  // revalidatePath("/shop");
  // revalidatePath("/learn");
  // revalidatePath("/quests");
  // revalidatePath("/leaderboard");
};