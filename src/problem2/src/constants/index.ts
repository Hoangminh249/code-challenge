export const PRICES_API_URL = "https://interview.switcheo.com/prices.json";

export const TOKEN_ICON_BASE_URL =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export const DEFAULT_FROM_SYMBOL = "USDC";
export const DEFAULT_TO_SYMBOL = "ETH";

export const AMOUNT_MAX_FRACTION_DIGITS = 6;
export const DECIMAL_PRECISION = 40;

export const PRICES_STALE_TIME_MS = 30_000;
export const PRICES_FETCH_TIMEOUT_MS = 10_000;
export const MOCK_SWAP_DELAY_MS = 1_200;
export const MOCK_SWAP_FAILURE_RATE = 0.05;

export const ICON_SYMBOL_ALIASES: Record<string, string> = {
  stEVMOS: "STEVMOS",
  ampLUNA: "AMPLUNA",
  axlUSDC: "AXLUSDC",
  wstETH: "WSTETH",
  YieldUSD: "YIELDUSD",
};
