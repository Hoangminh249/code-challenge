import { Button } from "@/components/ui/Button";
import { formatRateLine, formatTimeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

interface RateLineProps {
  fromSymbol: string;
  toSymbol: string;
  rate: string | null;
  updatedAt?: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
}

export function RateLine({
  fromSymbol,
  toSymbol,
  rate,
  updatedAt,
  isRefreshing = false,
  onRefresh,
}: RateLineProps) {
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
        <span className="text-foreground">
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
        disabled={isRefreshing}
        aria-label="Refresh exchange rate"
        className={cn(isRefreshing && "opacity-70")}
      >
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}
