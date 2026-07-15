import { fetchPrices } from "@/api/prices";
import { PRICES_STALE_TIME_MS } from "@/constants";
import { normalizePrices } from "@/lib/normalizePrices";
import { useQuery } from "@tanstack/react-query";

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

  return {
    ...query,
    tokens,
  };
}
