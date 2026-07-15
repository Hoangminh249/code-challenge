import { useMemo } from "react";
import Decimal from "decimal.js";
import type { Token } from "@/types/token";

function hashSymbol(symbol: string): number {
  return [...symbol].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function createBalance(symbol: string): string {
  const seed = hashSymbol(symbol);
  const base = 25 + (seed % 175);

  if (symbol === "ETH" || symbol === "WBTC" || symbol === "wstETH") {
    return new Decimal(base).div(1000).toFixed(6);
  }

  if (symbol === "USDC" || symbol === "BUSD" || symbol === "USD") {
    return new Decimal(base * 12).toFixed(2);
  }

  return new Decimal(base).div(10).toFixed(4);
}

export function useMockBalances(tokens: Token[]) {
  return useMemo(() => {
    const balances = new Map<string, string>();

    for (const token of tokens) {
      balances.set(token.symbol, createBalance(token.symbol));
    }

    return {
      getBalance(symbol: string | undefined): string {
        if (!symbol) {
          return "0";
        }

        return balances.get(symbol) ?? "0";
      },
    };
  }, [tokens]);
}
