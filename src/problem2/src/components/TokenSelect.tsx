import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useMemo, useState } from "react";
import { TokenIcon } from "@/components/TokenIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Token } from "@/types/token";

interface TokenSelectProps {
  id: string;
  label: string;
  tokens: Token[];
  value: string;
  disabledSymbol?: string;
  disabled?: boolean;
  onChange: (symbol: string) => void;
}

export function TokenSelect({
  id,
  label,
  tokens,
  value,
  disabledSymbol,
  disabled = false,
  onChange,
}: TokenSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = tokens.find((token) => token.symbol === value);

  const sortedTokens = useMemo(
    () =>
      [...tokens].sort((left, right) =>
        left.symbol.localeCompare(right.symbol),
      ),
    [tokens],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          id={id}
          variant="secondary"
          disabled={disabled}
          className="min-w-[132px] justify-between gap-2 rounded-xl px-3"
          aria-label={`${label}: ${selected?.symbol ?? "Select token"}`}
        >
          {disabled ? (
            <span className="text-muted">…</span>
          ) : selected ? (
            <>
              <TokenIcon symbol={selected.symbol} />
              <span className="font-semibold">{selected.symbol}</span>
            </>
          ) : (
            <span className="text-muted">Select</span>
          )}
          <span aria-hidden className="text-muted">
            ▾
          </span>
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-0 z-50 m-auto h-fit w-[min(92vw,420px)] rounded-2xl border border-border bg-surface p-4 shadow-card animate-fade-in"
          aria-label={`${label} token picker`}
        >
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="font-display text-lg font-semibold">
              Select token
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-muted hover:text-foreground"
                aria-label="Close"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-sm text-muted">
            Search by symbol. The opposite token is disabled.
          </Dialog.Description>

          <Command className="mt-4">
            <Command.Input
              placeholder="Search token..."
              className="w-full rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
            <Command.List className="mt-3 max-h-72 overflow-y-auto">
              <Command.Empty className="px-2 py-6 text-center text-sm text-muted">
                No token found.
              </Command.Empty>
              {sortedTokens.map((token) => {
                const isDisabled = token.symbol === disabledSymbol;
                const isSelected = token.symbol === value;

                return (
                  <Command.Item
                    key={token.symbol}
                    value={token.symbol}
                    disabled={isDisabled}
                    onSelect={() => {
                      if (isDisabled) {
                        return;
                      }

                      onChange(token.symbol);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex mr-1 cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm outline-none",
                      "data-[selected=true]:bg-surface-muted",
                      isDisabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <TokenIcon symbol={token.symbol} />
                      <span className="font-medium">{token.symbol}</span>
                    </span>
                    <span className="text-xs text-muted">
                      {isSelected
                        ? "Selected"
                        : `$${token.priceUsd.toFixed(4)}`}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
