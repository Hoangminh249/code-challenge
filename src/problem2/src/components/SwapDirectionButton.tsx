import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface SwapDirectionButtonProps {
  onSwap: () => void;
  disabled?: boolean;
  isAnimating?: boolean;
}

export function SwapDirectionButton({
  onSwap,
  disabled = false,
  isAnimating = false,
}: SwapDirectionButtonProps) {
  return (
    <div className="relative z-10 -my-3 flex justify-center">
      <Button
        type="button"
        variant="icon"
        className={cn(
          "border border-border bg-surface shadow-card",
          isAnimating && "swap-rotate",
        )}
        onClick={onSwap}
        disabled={disabled}
        aria-label="Swap token direction"
      >
        <svg
          aria-hidden
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 16V4M7 4L3 8M7 4L11 8" />
          <path d="M17 8V20M17 20L21 16M17 20L13 16" />
        </svg>
      </Button>
    </div>
  );
}
