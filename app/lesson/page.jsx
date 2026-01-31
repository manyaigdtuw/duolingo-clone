import { redirect } from "next/navigation";

import { Quiz } from "./quiz";

import { getCourseProgress, getLesson, getUserProgress } from "@/db/queries";

const LessonPage = async () => {
  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();

  const [userProgress, courseProgress] = await Promise.all([
    userProgressData,
    courseProgressData,
  ]);

  if (!userProgress || !courseProgress?.activeLessonId) {
    return redirect("/learn");
  }

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson || !userProgress) return redirect("/learn");

  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
      lesson.challenges.length) *
    100;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={Infinity} // Changed to Infinity
      initialPercentage={initialPercentage}
    // Removed: userSubscription prop
    />
  );
};

export default LessonPage;