import { describe, expect, it } from "vitest";
import type { PriceFeedEntry } from "@/types/token";
import { normalizePrices } from "@/lib/normalizePrices";
import { quoteSwap } from "@/lib/swapRate";

describe("normalizePrices", () => {
  it("deduplicates symbols and keeps the newest price", () => {
    const entries: PriceFeedEntry[] = [
      { currency: "USDC", date: "2023-08-29T07:10:30.000Z", price: 1 },
      { currency: "USDC", date: "2023-08-29T07:10:40.000Z", price: 0.99 },
      { currency: "BUSD", date: "2023-08-29T07:10:40.000Z", price: 0.999 },
      { currency: "BUSD", date: "2023-08-29T07:10:41.000Z", price: 1.001 },
    ];

    const tokens = normalizePrices(entries);

    expect(tokens).toHaveLength(2);
    expect(tokens.find((token) => token.symbol === "USDC")?.priceUsd).toBe(0.99);
    expect(tokens.find((token) => token.symbol === "BUSD")?.priceUsd).toBe(1.001);
  });

  it("drops invalid and non-positive prices", () => {
    const entries: PriceFeedEntry[] = [
      { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.93 },
      { currency: "BAD", date: "2023-08-29T07:10:40.000Z", price: 0 },
      { currency: "WORSE", date: "2023-08-29T07:10:40.000Z", price: -1 },
      { currency: "NAN", date: "2023-08-29T07:10:40.000Z", price: Number.NaN },
    ];

    const tokens = normalizePrices(entries);

    expect(tokens).toHaveLength(1);
    expect(tokens[0]?.symbol).toBe("ETH");
  });
});

describe("quoteSwap", () => {
  it("calculates receive amount using usd cross-rate", () => {
    const quote = quoteSwap("1.25", 1, 1645.93);

    expect(quote).not.toBeNull();
    expect(quote?.toAmount).toBe("0.000759");
    expect(quote?.rate).toBe("0.000608");
    expect(quote?.fromUsd).toBe("1.25");
  });

  it("returns null for empty or invalid amounts", () => {
    expect(quoteSwap("", 1, 2)).toBeNull();
    expect(quoteSwap("0", 1, 2)).toBeNull();
    expect(quoteSwap("abc", 1, 2)).toBeNull();
  });
});
