import Decimal from "decimal.js";
import { AMOUNT_MAX_FRACTION_DIGITS } from "@/constants";

export function formatUsd(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTokenAmount(value: string): string {
  if (!value) {
    return "";
  }

  try {
    return new Decimal(value).toFixed(AMOUNT_MAX_FRACTION_DIGITS);
  } catch {
    return value;
  }
}

export function formatTimeAgo(date: string | Date) {
  if (!date) {
    return "just now";
  }

  const diff = Date.now() - new Date(date).getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < hour) {
    return `${Math.floor(diff / minute)}m ago`;
  }

  if (diff < day) {
    const h = Math.floor(diff / hour);
    const m = Math.floor((diff % hour) / minute);
    return m ? `${h}h ${m}m ago` : `${h}h ago`;
  }

  if (diff < month) {
    const d = Math.floor(diff / day);
    const h = Math.floor((diff % day) / hour);
    return h ? `${d}d ${h}h ago` : `${d}d ago`;
  }

  if (diff < year) {
    const mo = Math.floor(diff / month);
    const d = Math.floor((diff % month) / day);
    return d ? `${mo}mo ${d}d ago` : `${mo}mo ago`;
  }

  const y = Math.floor(diff / year);
  const mo = Math.floor((diff % year) / month);
  return mo ? `${y}y ${mo}mo ago` : `${y}y ago`;
}

export function formatRateLine(
  fromSymbol: string,
  toSymbol: string,
  rate: string,
): string {
  return `1 ${fromSymbol} ≈ ${rate} ${toSymbol}`;
}
