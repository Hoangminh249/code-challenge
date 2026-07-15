import type { PriceFeedEntry, Token } from "@/types/token";

function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price > 0;
}

function isNewer(candidate: Token, existing: Token): boolean {
  return new Date(candidate.updatedAt).getTime() > new Date(existing.updatedAt).getTime();
}

export function normalizePrices(entries: PriceFeedEntry[]): Token[] {
  const bySymbol = new Map<string, Token>();

  for (const entry of entries) {
    if (!entry.currency || !isValidPrice(entry.price)) {
      continue;
    }

    const candidate: Token = {
      symbol: entry.currency,
      priceUsd: entry.price,
      updatedAt: entry.date,
    };

    const existing = bySymbol.get(entry.currency);
    if (!existing || isNewer(candidate, existing)) {
      bySymbol.set(entry.currency, candidate);
    }
  }

  return [...bySymbol.values()].sort((left, right) =>
    left.symbol.localeCompare(right.symbol),
  );
}

export function findToken(tokens: Token[], symbol: string | undefined): Token | undefined {
  if (!symbol) {
    return undefined;
  }

  return tokens.find((token) => token.symbol === symbol);
}
