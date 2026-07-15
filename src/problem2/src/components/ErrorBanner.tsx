import { Button } from "@/components/ui/Button";

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorBanner({
  message,
  onRetry,
  isRetrying = false,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="mb-4 flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-foreground">{message}</p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onRetry}
        isLoading={isRetrying}
      >
        Retry
      </Button>
    </div>
  );
}
