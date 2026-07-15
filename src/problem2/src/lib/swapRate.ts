import Decimal from "decimal.js";
import { AMOUNT_MAX_FRACTION_DIGITS, DECIMAL_PRECISION } from "@/constants";
import type { SwapQuote } from "@/types/token";

Decimal.set({ precision: DECIMAL_PRECISION });

export function sanitizeAmountInput(value: string): string {
  const normalized = value.replace(/,/g, ".").trim();
  if (!normalized) {
    return "";
  }

  const match = normalized.match(/^\d*\.?\d*/);
  return match?.[0] ?? "";
}

export function isPositiveAmount(value: string): boolean {
  if (!value || value === ".") {
    return false;
  }

  try {
    return new Decimal(value).gt(0);
  } catch {
    return false;
  }
}

export function compareAmounts(left: string, right: string): number {
  const leftValue = new Decimal(left || "0");
  const rightValue = new Decimal(right || "0");
  return leftValue.comparedTo(rightValue);
}

export function quoteSwap(
  fromAmount: string,
  fromPriceUsd: number,
  toPriceUsd: number,
): SwapQuote | null {
  if (!isPositiveAmount(fromAmount) || fromPriceUsd <= 0 || toPriceUsd <= 0) {
    return null;
  }

  const from = new Decimal(fromAmount);
  const fromUsd = from.mul(fromPriceUsd);
  const toAmount = fromUsd.div(toPriceUsd);
  const rate = new Decimal(fromPriceUsd).div(toPriceUsd);

  return {
    fromAmount: from.toFixed(AMOUNT_MAX_FRACTION_DIGITS),
    toAmount: toAmount.toFixed(AMOUNT_MAX_FRACTION_DIGITS),
    rate: rate.toFixed(AMOUNT_MAX_FRACTION_DIGITS),
    fromUsd: fromUsd.toFixed(2),
    toUsd: fromUsd.toFixed(2),
  };
}
