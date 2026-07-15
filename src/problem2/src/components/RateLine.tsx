import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

import { formatRateLine, formatTimeAgo } from "@/lib/format";

import { cn } from "@/lib/cn";

const MIN_REFRESHING_MS = 500;

interface RateLineProps {
  fromSymbol: string;

  toSymbol: string;

  rate: string | null;

  updatedAt?: string;

  isRefreshing?: boolean;

  isPriceLoading?: boolean;

  onRefresh: () => void;
}

function InlineSkeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block animate-pulse rounded-md bg-surface-muted",
        className,
      )}
    />
  );
}

function RefreshSpinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function RateLine({
  fromSymbol,
  toSymbol,
  rate,
  updatedAt,
  isRefreshing = false,
  isPriceLoading = false,
  onRefresh,
}: RateLineProps) {
  const [showRefreshing, setShowRefreshing] = useState(false);
  const refreshStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRefreshing) {
      refreshStartedAtRef.current = Date.now();
      setShowRefreshing(true);
      return;
    }

    if (!showRefreshing) {
      return;
    }

    const startedAt = refreshStartedAtRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_REFRESHING_MS - elapsed);
    const timeoutId = window.setTimeout(() => {
      setShowRefreshing(false);

      refreshStartedAtRef.current = null;
    }, remaining);

    return () => window.clearTimeout(timeoutId);
  }, [isRefreshing, showRefreshing]);

  if (isPriceLoading) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted/60 px-3 py-2.5 text-sm">
        <div className="flex flex-col gap-2">
          <InlineSkeleton className="h-4 w-48" />
          <InlineSkeleton className="h-3 w-24" />
        </div>
        <InlineSkeleton className="h-8 w-20 rounded-lg" />
      </div>
    );
  }

  if (!rate) {
    return (
      <p className="text-center text-sm text-muted">
        Enter an amount to preview the live exchange rate.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted/60 px-3 py-2.5 text-sm">
      <div className="flex flex-col text-muted">
        <span
          className={cn(
            "text-foreground transition-opacity",

            showRefreshing && "animate-pulse opacity-70",
          )}
        >
          {formatRateLine(fromSymbol, toSymbol, rate)}
        </span>

        <span className="text-xs">
          Updated {formatTimeAgo(updatedAt ?? "")}
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={showRefreshing}
        aria-label="Refresh exchange rate"
        className={cn("gap-2", showRefreshing && "opacity-70")}
      >
        {showRefreshing ? (
          <>
            <RefreshSpinner />
            Refreshing...
          </>
        ) : (
          "Refresh"
        )}
      </Button>
    </div>
  );
}
