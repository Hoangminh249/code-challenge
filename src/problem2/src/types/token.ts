export interface PriceFeedEntry {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  priceUsd: number;
  updatedAt: string;
}

export interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  rate: string;
  fromUsd: string;
  toUsd: string;
}

export interface MockSwapRequest {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  toAmount: string;
}

export interface MockSwapResult {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  toAmount: string;
  executedAt: string;
}

export type SubmitButtonState =
  | "loading_prices"
  | "select_tokens"
  | "enter_amount"
  | "insufficient_balance"
  | "invalid_amount"
  | "same_token"
  | "swapping"
  | "ready";
