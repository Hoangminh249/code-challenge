import { AmountInput } from "@/components/AmountInput";
import { TokenSelect } from "@/components/TokenSelect";
import { Button } from "@/components/ui/Button";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Token } from "@/types/token";

interface AssetPanelProps {
  id: string;
  label: string;
  amount: string;
  usdValue: string | null;
  tokens: Token[];
  selectedSymbol: string;
  disabledSymbol?: string;
  balance?: string;
  readOnly?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  showMax?: boolean;
  isLoading?: boolean;
  onAmountChange?: (value: string) => void;
  onTokenChange: (symbol: string) => void;
  onMaxClick?: () => void;
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

export function AssetPanel({
  id,
  label,
  amount,
  usdValue,
  tokens,
  selectedSymbol,
  disabledSymbol,
  balance,
  readOnly = false,
  invalid = false,
  errorMessage,
  showMax = false,
  isLoading = false,
  onAmountChange,
  onTokenChange,
  onMaxClick,
}: AssetPanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-surface-elevated p-4 transition-colors",
        invalid ? "border-destructive/80" : "border-border",
      )}
      aria-labelledby={`${id}-label`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <label
          id={`${id}-label`}
          htmlFor={`${id}-amount`}
          className="text-sm text-muted"
        >
          {label}
        </label>

        {balance !== undefined && (
          <div className="flex items-center gap-2 text-xs text-muted">
            {isLoading ? (
              <InlineSkeleton className="h-4 w-28" />
            ) : (
              <>
                <span>
                  Balance: <span className="text-foreground">{balance}</span>{" "}
                  {selectedSymbol}
                </span>

                {showMax && onMaxClick && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onMaxClick}
                    aria-label={`Use maximum ${selectedSymbol} balance`}
                  >
                    MAX
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isLoading ? (
          <InlineSkeleton className="h-9 flex-1" />
        ) : (
          <AmountInput
            id={`${id}-amount`}
            value={amount}
            readOnly={readOnly}
            invalid={invalid}
            onValueChange={onAmountChange ?? (() => undefined)}
            aria-describedby={errorMessage ? `${id}-error` : undefined}
          />
        )}

        <TokenSelect
          id={`${id}-token`}
          label={label}
          tokens={tokens}
          value={selectedSymbol}
          disabledSymbol={disabledSymbol}
          disabled={isLoading}
          onChange={onTokenChange}
        />
      </div>

      <p className="mt-2 text-right text-sm text-muted">
        {isLoading ? (
          <InlineSkeleton className="ml-auto h-4 w-24" />
        ) : !readOnly ? (
          <>≈ {usdValue ? formatUsd(usdValue) : "0"} USD</>
        ) : null}
      </p>

      {errorMessage && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      )}
    </section>
  );
}
