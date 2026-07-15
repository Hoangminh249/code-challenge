/**
 * WalletPage — Refactored solution
 *
 * Original code: see readme.md
 * Issues identified and fixed: see explain_en.md
 *
 * Each comment block explains what the original code did wrong
 * and why the new implementation is preferred.
 */

import { useMemo, type ComponentPropsWithoutRef, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Original problem:
 *   interface WalletBalance { currency: string; amount: number; }
 *   — missing `blockchain`, even though filter/sort read balance.blockchain
 *
 * Why it was problematic:
 *   TypeScript (strict) errors on `.blockchain`, or silently allows broken
 *   data contracts if types are bypassed. Runtime can pass `undefined` into
 *   getPriority → every row gets priority -99 and is filtered out.
 *
 * Why this is better:
 *   The type mirrors the real data contract. One source of truth for the domain.
 */
export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

/**
 * Original problem:
 *   FormattedWalletBalance duplicated currency/amount and still lacked blockchain.
 *   rows mapped sortedBalances but annotated as FormattedWalletBalance (type lie).
 *
 * Why it was problematic:
 *   Extending incorrectly hid the "missing formatted field" bug at compile time.
 *
 * Why this is better:
 *   `extends WalletBalance` keeps blockchain + currency + amount, adds `formatted`.
 */
export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

/**
 * Original problem:
 *   prices[currency] treated as always number → undefined * amount = NaN
 *
 * Why this is better:
 *   PriceMap admits missing keys so callers must guard before multiplying.
 */
export type PriceMap = Record<string, number | undefined>;

/**
 * Original problem:
 *   interface Props extends BoxProps {}  (empty extension)
 *   React.FC<Props> + render <div {...rest}> while BoxProps may include MUI-only props
 *
 * Why it was problematic:
 *   Empty interface is noise; BoxProps on a native div is a type/runtime mismatch.
 *
 * Why this is better:
 *   Props match the actual element we render (a div).
 */
type WalletPageProps = ComponentPropsWithoutRef<"div">;

/**
 * Known chains used for priority ordering.
 * Prefer a union over `any` so typos fail at compile time when used as literals.
 */
export type Blockchain =
  | "Osmosis"
  | "Ethereum"
  | "Arbitrum"
  | "Zilliqa"
  | "Neo";

// ---------------------------------------------------------------------------
// Domain helpers (module scope — NOT inside the component)
// ---------------------------------------------------------------------------

/**
 * Original problem:
 *   const getPriority = (blockchain: any) => { switch... }  declared INSIDE WalletPage
 *
 * Why it was problematic:
 *   1) `any` disables type checking
 *   2) New function identity every render (unnecessary allocation)
 *   3) Domain logic mixed with UI — hard to unit-test in isolation
 *
 * Why this is better:
 *   Pure module-level function + Record map. No useCallback needed.
 *   Testable without mounting React. Easy to extend when adding a chain.
 *
 * Why NOT useCallback?
 *   useCallback is for stabilizing identities passed to memoized children.
 *   This function does not close over props/state — hoist instead.
 */
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const UNSUPPORTED_PRIORITY = -99;

export function getBlockchainPriority(blockchain: string): number {
  return (
    BLOCKCHAIN_PRIORITY[blockchain as Blockchain] ?? UNSUPPORTED_PRIORITY
  );
}

export function isSupportedBlockchain(blockchain: string): boolean {
  return getBlockchainPriority(blockchain) > UNSUPPORTED_PRIORITY;
}

/**
 * Original problem:
 *   Nested ifs that KEPT amount <= 0 and DROPPED amount > 0 (inverted filter)
 *   plus typo: `if (lhsPriority > -99)` while the local var was `balancePriority`
 *
 * Why it was problematic:
 *   lhsPriority → ReferenceError (crash) OR wrong global if it existed.
 *   Even after fixing the typo, positive balances were hidden from the UI.
 *
 * Why this is better:
 *   Named predicates — intent is obvious in code review.
 */
function hasPositiveBalance(balance: WalletBalance): boolean {
  return balance.amount > 0;
}

/**
 * Original problem:
 *   sort comparator returned nothing when priorities were equal → undefined
 *
 * Why it was problematic:
 *   Array.sort requires a numeric return. Equal case must return 0 for a
 *   well-defined, stable ordering contract.
 *
 * Why this is better:
 *   `right - left` → descending priority, and 0 when equal (one expression).
 */
function compareByBlockchainPriority(
  lhs: WalletBalance,
  rhs: WalletBalance,
): number {
  return (
    getBlockchainPriority(rhs.blockchain) -
    getBlockchainPriority(lhs.blockchain)
  );
}

/**
 * Original problem:
 *   balance.amount.toFixed()  // default = 0 decimal places → "1" for 1.2345
 *
 * Why this is better:
 *   Explicit display precision for crypto-style amounts. Named constant.
 */
const DISPLAY_DECIMALS = 4;

function formatBalanceAmount(amount: number): string {
  return amount.toFixed(DISPLAY_DECIMALS);
}

/**
 * Original problem:
 *   const usdValue = prices[balance.currency] * balance.amount
 *   — missing price → NaN rendered in the UI
 *
 * Why this is better:
 *   Explicit nullish guard. Product can later choose 0 vs "—" vs hide row.
 */
function toUsdValue(
  amount: number,
  currency: string,
  prices: PriceMap,
): number {
  const price = prices[currency];
  if (price == null) {
    return 0;
  }
  return price * amount;
}

/**
 * Original problem:
 *   Broken pipeline:
 *     useMemo(filter+sort) → sortedBalances
 *     formattedBalances = sortedBalances.map(format)   // NEVER USED
 *     rows = sortedBalances.map(...)                   // reads .formatted → undefined
 *
 * Why it was problematic:
 *   Dead O(n) work every render; formattedAmount always undefined; type lie.
 *
 * Why this is better:
 *   One pure pipeline: filter → sort → format. Single source for the list UI.
 */
function buildFormattedBalances(
  balances: WalletBalance[],
): FormattedWalletBalance[] {
  return balances
    .filter(
      (balance) =>
        isSupportedBlockchain(balance.blockchain) &&
        hasPositiveBalance(balance),
    )
    .sort(compareByBlockchainPriority)
    .map((balance) => ({
      ...balance,
      formatted: formatBalanceAmount(balance.amount),
    }));
}

// ---------------------------------------------------------------------------
// External stubs (same assumptions as the original exercise snippet)
// ---------------------------------------------------------------------------

interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): PriceMap;
declare function WalletRow(props: WalletRowProps): ReactNode;

/**
 * Original problem:
 *   className={classes.row}  — `classes` never imported → ReferenceError on render
 *
 * Why this is better:
 *   Explicit constant (or CSS module import in a real app).
 */
const ROW_CLASS_NAME = "wallet-row";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Original problem:
 *   const WalletPage: React.FC<Props> = (props) => {
 *     const { children, ...rest } = props;
 *     // children never rendered
 *     return <div {...rest}>{rows}</div>
 *   }
 *
 * Why it was problematic:
 *   React.FC adds implicit children; destructuring without rendering swallows them.
 *
 * Why this is better:
 *   Plain function + explicit props. children rendered when provided.
 */
export function WalletPage({ children, className, ...rest }: WalletPageProps) {
  const balances = useWalletBalances();
  const prices = usePrices();

  /**
   * Original problem:
   *   useMemo(..., [balances, prices])
   *   — callback never reads `prices`, so every price tick re-ran filter+sort
   *
   * Why it was problematic:
   *   Crypto price feeds often tick every few seconds → wasted O(n log n) work.
   *   Misleading dependency array (suggests sort depends on prices).
   *
   * Why this is better:
   *   Deps = [balances] only — matches what the memoized function actually uses.
   *   USD conversion stays outside useMemo and correctly reacts to `prices`.
   *
   * When WOULD prices belong in deps?
   *   If we sorted/filtered by USD value. We do not — priority is chain-based.
   */
  const formattedBalances = useMemo(
    () => buildFormattedBalances(balances),
    [balances],
  );

  /**
   * Production note: real hooks often return { data, isLoading, error }.
   * An early-return skeleton/error UI would belong here when those APIs exist.
   */

  return (
    <div className={className} {...rest}>
      {children}
      {formattedBalances.map((balance) => (
        <WalletRow
          /**
           * Original problem: key={index}
           * Why bad: reorder/filter reuses wrong DOM/state (reconciliation by position)
           * Why better: identity key stable across sort — blockchain + currency
           */
          key={`${balance.blockchain}-${balance.currency}`}
          className={ROW_CLASS_NAME}
          amount={balance.amount}
          usdValue={toUsdValue(balance.amount, balance.currency, prices)}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
}
