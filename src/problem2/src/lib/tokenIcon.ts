import {
  ICON_SYMBOL_ALIASES,
  TOKEN_ICON_BASE_URL,
} from "@/constants";

export function resolveIconSymbol(symbol: string): string {
  return ICON_SYMBOL_ALIASES[symbol] ?? symbol.toUpperCase();
}

export function getTokenIconUrl(symbol: string): string {
  const iconSymbol = resolveIconSymbol(symbol);
  return `${TOKEN_ICON_BASE_URL}/${iconSymbol}.svg`;
}

export function getTokenInitial(symbol: string): string {
  return symbol.charAt(0).toUpperCase();
}
