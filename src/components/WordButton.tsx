import { cn } from "@/lib/utils";

interface WordButtonProps {
  word: string;
  state: 'default' | 'selected' | 'correct' | 'wrong';
  onClick: () => void;
  disabled?: boolean;
}

export const WordButton = ({ word, state, onClick, disabled }: WordButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full py-6 px-4 rounded-2xl font-semibold text-lg transition-all duration-300",
        "shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "border-2",
        state === 'default' && "bg-card text-card-foreground border-border hover:border-primary",
        state === 'selected' && "bg-selected text-selected-foreground border-selected scale-105",
        state === 'correct' && "bg-success text-success-foreground border-success scale-105",
        state === 'wrong' && "bg-destructive text-destructive-foreground border-destructive animate-shake"
      )}
    >
      {word}
    </button>
  );
};
