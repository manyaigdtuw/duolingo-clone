import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChallengeInputProps = {
  value?: string;
  onChange: (value: string) => void;
  status?: "correct" | "wrong" | "none";
  disabled?: boolean;
};

export const ChallengeInput = ({
  value,
  onChange,
  status,
  disabled,
}: ChallengeInputProps) => {
  return (
    <div className={cn("flex w-full flex-col gap-y-4")}>
      <Input
        autoFocus
        disabled={disabled}
        placeholder="Type your answer..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full bg-slate-100",
          status === "correct" && "bg-green-100 border-green-500 text-green-700",
          status === "wrong" && "bg-rose-100 border-rose-500 text-rose-700"
        )}
      />
      {status === "correct" && (
        <p className="text-sm font-bold text-green-500">Correct!</p>
      )}
      {status === "wrong" && (
        <p className="text-sm font-bold text-rose-500">Incorrect.</p>
      )}
    </div>
  );
};
