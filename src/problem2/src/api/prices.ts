import {
  PRICES_API_URL,
  PRICES_FETCH_TIMEOUT_MS,
} from "@/constants";
import type { PriceFeedEntry } from "@/types/token";

export class PricesFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricesFetchError";
  }
}

export async function fetchPrices(signal?: AbortSignal): Promise<PriceFeedEntry[]> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), PRICES_FETCH_TIMEOUT_MS);

  const abortFromParent = () => controller.abort();
  signal?.addEventListener("abort", abortFromParent);

  try {
    const response = await fetch(PRICES_API_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new PricesFetchError(`Failed to load prices (${response.status})`);
    }

    const data = (await response.json()) as PriceFeedEntry[];

    if (!Array.isArray(data)) {
      throw new PricesFetchError("Price feed returned an unexpected format");
    }

    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new PricesFetchError("Price request timed out. Please retry.");
    }

    if (error instanceof PricesFetchError) {
      throw error;
    }

    throw new PricesFetchError("Unable to reach the price feed. Check your connection.");
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortFromParent);
  }
}
