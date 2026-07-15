import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPrices } from "@/api/prices";
import { PRICES_STALE_TIME_MS } from "@/constants";
import { findToken, normalizePrices } from "@/lib/normalizePrices";
import type { Token } from "@/types/token";

export function usePrices() {
  const query = useQuery({
    queryKey: ["prices"],
    queryFn: ({ signal }) => fetchPrices(signal),
    staleTime: PRICES_STALE_TIME_MS,
    retry: 2,
    refetchOnWindowFocus: true,
    select: normalizePrices,
  });

  const tokens = query.data ?? [];

  const helpers = useMemo(
    () => ({
      getToken(symbol: string | undefined): Token | undefined {
        return findToken(tokens, symbol);
      },
    }),
    [tokens],
  );

  return {
    ...query,
    tokens,
    ...helpers,
  };
}
