import type { SubmitButtonState } from "@/types/token";

interface ResolveSubmitLabelParams {
  state: SubmitButtonState;
  fromSymbol?: string;
}

const LABELS: Record<SubmitButtonState, string> = {
  loading_prices: "Loading prices...",
  select_tokens: "Select tokens",
  enter_amount: "Enter an amount",
  insufficient_balance: "Insufficient balance",
  invalid_amount: "Enter a valid amount",
  same_token: "Choose different tokens",
  swapping: "Swapping...",
  ready: "Confirm swap",
};

export function resolveSubmitLabel({
  state,
  fromSymbol,
}: ResolveSubmitLabelParams): string {
  if (state === "insufficient_balance" && fromSymbol) {
    return `Insufficient ${fromSymbol} balance`;
  }

  return LABELS[state];
}

export function resolveSubmitState(params: {
  isLoadingPrices: boolean;
  isSwapping: boolean;
  fromSymbol: string;
  toSymbol: string;
  amount: string;
  hasInsufficientBalance: boolean;
  isAmountValid: boolean;
}): SubmitButtonState {
  if (params.isLoadingPrices) {
    return "loading_prices";
  }

  if (params.isSwapping) {
    return "swapping";
  }

  if (!params.fromSymbol || !params.toSymbol) {
    return "select_tokens";
  }

  if (params.fromSymbol === params.toSymbol) {
    return "same_token";
  }

  if (!params.amount.trim()) {
    return "enter_amount";
  }

  if (!params.isAmountValid) {
    return "invalid_amount";
  }

  if (params.hasInsufficientBalance) {
    return "insufficient_balance";
  }

  return "ready";
}
