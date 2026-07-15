/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRICES_API_URL: string;
  readonly VITE_TOKEN_ICON_BASE_URL: string;
  readonly VITE_DEFAULT_FROM_SYMBOL: string;
  readonly VITE_DEFAULT_TO_SYMBOL: string;
  readonly VITE_AMOUNT_MAX_FRACTION_DIGITS: string;
  readonly VITE_DECIMAL_PRECISION: string;
  readonly VITE_PRICES_STALE_TIME_MS: string;
  readonly VITE_PRICES_FETCH_TIMEOUT_MS: string;
  readonly VITE_MOCK_SWAP_DELAY_MS: string;
  readonly VITE_MOCK_SWAP_FAILURE_RATE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
