import { SubmitButtonState } from "@/types/token";

interface ResolveSubmitLabelParams {
  state: SubmitButtonState;
  fromSymbol?: string;
}

const LABELS: Record<SubmitButtonState, string> = {
  [SubmitButtonState.LoadingPrices]: "Loading prices...",
  [SubmitButtonState.SelectTokens]: "Select tokens",
  [SubmitButtonState.EnterAmount]: "Enter an amount",
  [SubmitButtonState.InsufficientBalance]: "Insufficient balance",
  [SubmitButtonState.InvalidAmount]: "Enter a valid amount",
  [SubmitButtonState.SameToken]: "Choose different tokens",
  [SubmitButtonState.Swapping]: "Swapping...",
  [SubmitButtonState.Ready]: "Confirm swap",
};

export function resolveSubmitLabel({
  state,
  fromSymbol,
}: ResolveSubmitLabelParams): string {
  if (state === SubmitButtonState.InsufficientBalance && fromSymbol) {
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
    return SubmitButtonState.LoadingPrices;
  }

  if (params.isSwapping) {
    return SubmitButtonState.Swapping;
  }

  if (!params.fromSymbol || !params.toSymbol) {
    return SubmitButtonState.SelectTokens;
  }

  if (params.fromSymbol === params.toSymbol) {
    return SubmitButtonState.SameToken;
  }

  if (!params.amount.trim()) {
    return SubmitButtonState.EnterAmount;
  }

  if (!params.isAmountValid) {
    return SubmitButtonState.InvalidAmount;
  }

  if (params.hasInsufficientBalance) {
    return SubmitButtonState.InsufficientBalance;
  }

  return SubmitButtonState.Ready;
}
