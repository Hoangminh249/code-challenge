import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AssetPanel } from "@/components/AssetPanel";
import { ErrorBanner } from "@/components/ErrorBanner";
import { RateLine } from "@/components/RateLine";
import { SwapDirectionButton } from "@/components/SwapDirectionButton";
import { Button } from "@/components/ui/Button";
import { DEFAULT_FROM_SYMBOL, DEFAULT_TO_SYMBOL } from "@/constants";
import { useMockBalances } from "@/hooks/useMockBalances";
import { usePrices } from "@/hooks/usePrices";
import { findToken } from "@/lib/normalizePrices";
import { mockSwap } from "@/lib/mockSwap";
import { resolveSubmitLabel, resolveSubmitState } from "@/lib/submitState";
import { swapFormSchema, type SwapFormValues } from "@/lib/swapFormSchema";
import { compareAmounts, isPositiveAmount, quoteSwap } from "@/lib/swapRate";
import { SubmitButtonState, type Token } from "@/types/token";

function pickDefaultSymbol(
  tokens: Token[],
  preferred: string,
  fallback: string,
): string {
  if (findToken(tokens, preferred)) {
    return preferred;
  }
  if (findToken(tokens, fallback)) {
    return fallback;
  }
  return tokens[0]?.symbol ?? "";
}

export function SwapCard() {
  const {
    tokens,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = usePrices();

  const { getBalance } = useMockBalances(tokens);

  //States
  const [isSwapping, setIsSwapping] = useState(false);
  const [isDirectionAnimating, setIsDirectionAnimating] = useState(false);
  const swapAbortRef = useRef<AbortController | null>(null);
  const hasSeededDefaults = useRef(false);

  // form
  const form = useForm<SwapFormValues>({
    resolver: zodResolver(swapFormSchema),
    mode: "onChange",
    defaultValues: {
      fromSymbol: "",
      toSymbol: "",
      amount: "",
    },
  });

  const { watch, setValue, handleSubmit, formState } = form;
  const fromSymbol = watch("fromSymbol");
  const toSymbol = watch("toSymbol");
  const amount = watch("amount");
  const fromBalance = getBalance(fromSymbol);

  const [fromToken, toToken, quote] = useMemo(() => {
    const fromToken = findToken(tokens, fromSymbol);
    const toToken = findToken(tokens, toSymbol);
    const quote =
      fromToken?.priceUsd && toToken?.priceUsd
        ? quoteSwap(amount, fromToken.priceUsd, toToken.priceUsd)
        : null;

    return [fromToken, toToken, quote];
  }, [amount, fromSymbol, toSymbol, tokens]);

  // Validation - status
  const [submitLabel, submitState, hasInsufficientBalance] = useMemo(() => {
    const hasInsufficientBalance =
      isPositiveAmount(amount) && compareAmounts(amount, fromBalance) > 0;

    const submitState = resolveSubmitState({
      isLoadingPrices: isLoading,
      isSwapping,
      fromSymbol,
      toSymbol,
      amount,
      hasInsufficientBalance,
      isAmountValid: isPositiveAmount(amount),
    });
    const submitLabel = resolveSubmitLabel({
      state: submitState,
      fromSymbol,
    });
    return [submitLabel, submitState, hasInsufficientBalance];
  }, [fromSymbol, toSymbol, amount, isLoading, isSwapping, fromBalance]);

  const latestUpdatedAt = useMemo(() => {
    const timestamps = [fromToken?.updatedAt, toToken?.updatedAt]
      .filter(Boolean)
      .map((value) => new Date(value as string).getTime());

    if (!timestamps.length) {
      return dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : undefined;
    }
    return new Date(Math.max(...timestamps)).toISOString();
  }, [dataUpdatedAt, fromToken?.updatedAt, toToken?.updatedAt]);

  const onFieldChange = (field: keyof SwapFormValues, value: string) => {
    setValue(field, value as SwapFormValues[typeof field], {
      shouldValidate: true,
    });
  };

  const runSwap = async (values: SwapFormValues) => {
    if (!quote || !fromToken || !toToken) {
      return;
    }
    swapAbortRef.current?.abort();
    const controller = new AbortController();
    swapAbortRef.current = controller;
    setIsSwapping(true);
    try {
      const result = await mockSwap(
        {
          fromSymbol: values.fromSymbol,
          toSymbol: values.toSymbol,
          fromAmount: values.amount,
          toAmount: quote.toAmount,
        },
        controller.signal,
      );

      toast.success("Swap completed", {
        description: `${result.fromAmount} ${result.fromSymbol} → ${result.toAmount} ${result.toSymbol}`,
      });

      setValue("amount", "");
    } catch (swapError) {
      if (
        swapError instanceof DOMException &&
        swapError.name === "AbortError"
      ) {
        return;
      }
      const message =
        swapError instanceof Error
          ? swapError.message
          : "Swap failed. Please try again.";

      toast.error("Swap failed", {
        description: message,
        action: {
          label: "Retry",
          onClick: () => {
            void handleSubmit(runSwap)();
          },
        },
      });
    } finally {
      setIsSwapping(false);
      swapAbortRef.current = null;
    }
  };

  const handleDirectionSwap = () => {
    if (!fromSymbol || !toSymbol) {
      return;
    }
    setIsDirectionAnimating(true);
    window.setTimeout(() => setIsDirectionAnimating(false), 350);
    setValue("fromSymbol", toSymbol);
    setValue("toSymbol", fromSymbol);
    setValue("amount", "");
  };

  // Initialize - default symbols
  useEffect(() => {
    if (!tokens.length || hasSeededDefaults.current) {
      return;
    }
    const from = pickDefaultSymbol(
      tokens,
      DEFAULT_FROM_SYMBOL,
      DEFAULT_TO_SYMBOL,
    );
    const to = pickDefaultSymbol(
      tokens.filter((token) => token.symbol !== from),
      DEFAULT_TO_SYMBOL,
      from === DEFAULT_FROM_SYMBOL ? DEFAULT_TO_SYMBOL : DEFAULT_FROM_SYMBOL,
    );
    setValue("fromSymbol", from);
    setValue("toSymbol", to);

    hasSeededDefaults.current = true;
  }, [setValue, tokens]);

  return (
    <form
      onSubmit={handleSubmit(runSwap)}
      className="w-full max-w-[620px] rounded-3xl border border-border bg-surface/80 p-5 shadow-glow backdrop-blur animate-fade-in"
      noValidate
    >
      <header className="mb-5">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Switcheo
        </p>

        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Currency Swap
        </h1>

        <p className="mt-1 text-sm text-muted">
          Live prices from the interview feed. Balances are mocked for demo.
        </p>
      </header>

      {isError && !tokens.length && (
        <div className="mb-4">
          <ErrorBanner
            message={
              error instanceof Error
                ? error.message
                : "Unable to load token prices."
            }
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        </div>
      )}

      <div className="space-y-1">
        <AssetPanel
          id="from"
          label="From"
          amount={amount}
          usdValue={quote?.fromUsd ?? null}
          tokens={tokens}
          selectedSymbol={fromSymbol}
          disabledSymbol={toSymbol}
          balance={fromBalance}
          isLoading={isLoading && tokens.length === 0}
          invalid={
            hasInsufficientBalance ||
            (Boolean(amount.trim()) && Boolean(form.formState.errors.amount))
          }
          errorMessage={
            hasInsufficientBalance
              ? `You only have ${fromBalance} ${fromSymbol}.`
              : amount.trim()
                ? form.formState.errors.amount?.message
                : undefined
          }
          showMax
          onAmountChange={(value) => onFieldChange("amount", value)}
          onTokenChange={(symbol) => onFieldChange("fromSymbol", symbol)}
          onMaxClick={() => onFieldChange("amount", fromBalance)}
        />
        <SwapDirectionButton
          onSwap={handleDirectionSwap}
          disabled={!fromSymbol || !toSymbol || isSwapping || isLoading}
          isAnimating={isDirectionAnimating}
        />
        <AssetPanel
          id="to"
          label="To"
          amount={quote?.toAmount ?? ""}
          usdValue={quote?.toUsd ?? null}
          tokens={tokens}
          selectedSymbol={toSymbol}
          disabledSymbol={fromSymbol}
          readOnly
          isLoading={isLoading}
          onTokenChange={(symbol) => onFieldChange("toSymbol", symbol)}
        />
      </div>

      <div className="mt-4">
        <RateLine
          fromSymbol={fromSymbol}
          toSymbol={toSymbol}
          rate={quote?.rate ?? null}
          updatedAt={latestUpdatedAt}
          isRefreshing={isFetching}
          isPriceLoading={isLoading}
          onRefresh={refetch}
        />
      </div>

      {formState.errors.toSymbol?.message && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {formState.errors.toSymbol.message}
        </p>
      )}

      <Button
        type="submit"
        className="mt-5 w-full"
        disabled={submitState !== SubmitButtonState.Ready}
        isLoading={isSwapping}
        aria-live="polite"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
