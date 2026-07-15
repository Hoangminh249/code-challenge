import { useState } from "react";
import { cn } from "@/lib/cn";
import { getTokenIconUrl, getTokenInitial } from "@/lib/tokenIcon";

interface TokenIconProps {
  symbol: string;
  className?: string;
}

export function TokenIcon({ symbol, className }: TokenIconProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-foreground",
          className,
        )}
      >
        {getTokenInitial(symbol)}
      </span>
    );
  }

  return (
    <img
      src={getTokenIconUrl(symbol)}
      alt=""
      loading="lazy"
      className={cn("h-7 w-7 rounded-full", className)}
      onError={() => setHasError(true)}
    />
  );
}
