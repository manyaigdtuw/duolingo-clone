import { useState } from "react";

import { cn } from "@/lib/utils";

export const ChallengeFillIn = ({
  options, // Contains the correct answer as one option with correct: true
  onSelect,
  status,
  disabled,
}) => {
  const [value, setValue] = useState("");

  const correctOption = options.find((o) => o.correct);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setValue(inputValue);

    if (inputValue.length > 0) {
      if (
        correctOption &&
        inputValue.toLowerCase().trim() ===
          correctOption.text.toLowerCase().trim()
      ) {
        onSelect(correctOption.id);
      } else {
        onSelect(-1); // Invalid ID
      }
    } else {
      onSelect(undefined); // No selection
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-y-2")}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type your answer..."
        disabled={disabled || status !== "none"}
        className={cn(
          "rounded-xl border-2 px-4 py-3 text-lg transition hover:border-slate-300 focus:border-sky-500 focus:outline-none",
          status === "correct" &&
            "border-green-500 bg-green-100 text-green-600",
          status === "wrong" && "border-rose-500 bg-rose-100 text-rose-600"
        )}
      />
    </div>
  );
};
