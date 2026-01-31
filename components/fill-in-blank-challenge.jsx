import { useEffect, useState } from "react";
import { useAudio } from "react-use";

import { cn } from "@/lib/utils";

export const FillInBlankChallenge = ({
  question,
  correctAnswers = [],
  onAnswer,
  status,
  disabled,
  placeholder = "Type your answer...",
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [audio, _, controls] = useAudio({ src: "/type.wav" });

  // Handle input change
  const handleInputChange = (e) => {
    if (disabled || status !== "none") return;

    setUserAnswer(e.target.value);
    // Play typing sound on significant input
    if (e.target.value.length > 0) {
      void controls.play();
    }
  };

  // Handle key press (Enter to submit)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && userAnswer.trim() !== "") {
      checkAnswer();
    }
  };

  // Check if answer is correct
  const checkAnswer = () => {
    if (disabled || status !== "none" || !userAnswer.trim()) return;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const isCorrect = correctAnswers.some(correct => {
      const normalizedCorrect = correct.answer.toLowerCase();
      return correct.is_case_sensitive
        ? userAnswer.trim() === correct.answer
        : normalizedUserAnswer === normalizedCorrect;
    });

    onAnswer(isCorrect);
  };

  // Reset input when question changes or when retrying
  useEffect(() => {
    setUserAnswer("");
  }, [question]);

  // Clear input when status changes back to "none" (retry)
  useEffect(() => {
    if (status === "none") {
      setUserAnswer("");
    }
  }, [status]);

  // Auto-focus on input
  useEffect(() => {
    const input = document.getElementById("fill-blank-input");
    if (input && status === "none") {
      input.focus();
    }
  }, [status, question]);

  return (
    <div className="space-y-4">
      {audio}

      {/* Question with blank */}
      <div className="text-lg font-medium text-neutral-700 mb-6">
        {question.split("____").map((part, index, array) => (
          <span key={index}>
            {part}
            {index < array.length - 1 && (
              <span className="relative inline-block mx-2">
                <input
                  id="fill-blank-input"
                  type="text"
                  value={userAnswer}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={disabled || status !== "none"}
                  className={cn(
                    "w-32 md:w-48 px-3 py-2 border-2 rounded-lg text-center font-medium",
                    "focus:outline-none focus:border-sky-400",
                    status === "correct" && "border-green-500 bg-green-50",
                    status === "wrong" && "border-rose-500 bg-rose-50",
                    (disabled || status !== "none") && "cursor-not-allowed opacity-70"
                  )}
                  placeholder={placeholder}
                />
                {status === "correct" && (
                  <span className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-green-500">
                    ✓
                  </span>
                )}
                {status === "wrong" && (
                  <span className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-rose-500">
                    ✗
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Show correct answer if wrong */}
      {status === "wrong" && correctAnswers.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-700">
            <span className="font-semibold">Correct answer(s):</span>{" "}
            {correctAnswers.map(ca => ca.answer).join(", ")}
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={() => {
          if (status === "wrong") {
            // Reset to allow retry
            onAnswer(null); // Signal to parent to reset status
          } else {
            checkAnswer();
          }
        }}
        disabled={disabled || (status === "none" && !userAnswer.trim()) || status === "correct"}
        className={cn(
          "w-full py-3 px-4 rounded-lg font-semibold transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          status === "none" && "bg-sky-500 hover:bg-sky-600 text-white",
          status === "correct" && "bg-green-500 text-white",
          status === "wrong" && "bg-rose-500 hover:bg-rose-600 text-white"
        )}
      >
        {status === "none" && "Check Answer"}
        {status === "correct" && "Correct! Continue"}
        {status === "wrong" && "Try Again"}
      </button>
    </div>
  );
};