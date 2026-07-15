import { MOCK_SWAP_DELAY_MS, MOCK_SWAP_FAILURE_RATE } from "@/constants";
import type { MockSwapRequest, MockSwapResult } from "@/types/token";

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Swap cancelled", "AbortError"));
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }

    signal?.addEventListener("abort", onAbort);
  });
}

export async function mockSwap(
  request: MockSwapRequest,
  signal?: AbortSignal,
): Promise<MockSwapResult> {
  await wait(MOCK_SWAP_DELAY_MS, signal);

  if (Math.random() < MOCK_SWAP_FAILURE_RATE) {
    throw new Error("Swap failed. Network congestion — please try again.");
  }

  return {
    id: crypto.randomUUID(),
    fromSymbol: request.fromSymbol,
    toSymbol: request.toSymbol,
    fromAmount: request.fromAmount,
    toAmount: request.toAmount,
    executedAt: new Date().toISOString(),
  };
}
