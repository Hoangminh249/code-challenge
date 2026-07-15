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

export enum SubmitButtonState {
  LoadingPrices = "loading_prices",
  SelectTokens = "select_tokens",
  EnterAmount = "enter_amount",
  InsufficientBalance = "insufficient_balance",
  InvalidAmount = "invalid_amount",
  SameToken = "same_token",
  Swapping = "swapping",
  Ready = "ready",
}
