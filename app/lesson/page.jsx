import { redirect } from "next/navigation";
import { Quiz } from "./quiz";
import { getLesson, getUserProgress } from "@/db/queries";

const LessonPage = async () => {
  const lessonData = getLesson();
  const userProgressData = getUserProgress();
  // Removed: userSubscriptionData

  const [lesson, userProgress] = await Promise.all([
    lessonData,
    userProgressData,
  ]);

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