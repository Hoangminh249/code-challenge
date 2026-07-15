function readString(key: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[key];
  return value?.trim() ? value : fallback;
}

function readNumber(key: keyof ImportMetaEnv, fallback: number): number {
  const raw = import.meta.env[key];
  if (!raw?.trim()) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const PRICES_API_URL = readString(
  "VITE_PRICES_API_URL",
  "https://interview.switcheo.com/prices.json",
);

export const TOKEN_ICON_BASE_URL = readString(
  "VITE_TOKEN_ICON_BASE_URL",
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens",
);

export const DEFAULT_FROM_SYMBOL = readString("VITE_DEFAULT_FROM_SYMBOL", "USDC");
export const DEFAULT_TO_SYMBOL = readString("VITE_DEFAULT_TO_SYMBOL", "ETH");

export const AMOUNT_MAX_FRACTION_DIGITS = readNumber(
  "VITE_AMOUNT_MAX_FRACTION_DIGITS",
  6,
);
export const DECIMAL_PRECISION = readNumber("VITE_DECIMAL_PRECISION", 40);

export const PRICES_STALE_TIME_MS = readNumber("VITE_PRICES_STALE_TIME_MS", 30_000);
export const PRICES_FETCH_TIMEOUT_MS = readNumber(
  "VITE_PRICES_FETCH_TIMEOUT_MS",
  10_000,
);
export const MOCK_SWAP_DELAY_MS = readNumber("VITE_MOCK_SWAP_DELAY_MS", 1_200);
export const MOCK_SWAP_FAILURE_RATE = readNumber(
  "VITE_MOCK_SWAP_FAILURE_RATE",
  0.05,
);

export const ICON_SYMBOL_ALIASES: Record<string, string> = {
  stEVMOS: "STEVMOS",
  ampLUNA: "AMPLUNA",
  axlUSDC: "AXLUSDC",
  wstETH: "WSTETH",
  YieldUSD: "YIELDUSD",
};
