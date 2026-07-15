# Problem 3 — WalletPage: Issues and Refactoring

## What the component is supposed to do

`WalletPage` fetches wallet balances via `useWalletBalances()` and token prices via `usePrices()`, then filters to supported blockchains with a positive balance, sorts by blockchain priority (descending), formats each amount, and renders a `WalletRow` per balance with its USD value.

The original implementation contains **16 issues** across logic, TypeScript, React patterns, and performance. Several are production-blocking crashes.

---

## Issues found

### Logic / Runtime errors

**1. `lhsPriority` — undefined variable (typo, Critical)**
The filter uses `lhsPriority` but the local variable is named `balancePriority`. This is a `ReferenceError` that crashes the component on every render.

```tsx
// original — crashes
if (lhsPriority > -99) { ... }

// fix
if (balancePriority > -99) { ... }
```

**2. Inverted filter logic (Critical)**
The condition keeps balances with `amount <= 0` and drops `amount > 0`. A user with 5 ETH sees nothing; empty wallets are shown instead.

```tsx
// original — shows zero/negative balances, hides positive ones
if (balance.amount <= 0) return true;
return false;

// fix
return balancePriority > -99 && balance.amount > 0;
```

**3. Wrong map source — `formattedAmount` is always `undefined` (Critical)**
`rows` maps `sortedBalances`, which has no `formatted` field. The variable `formattedBalances` that does add `formatted` is computed but never consumed.

```tsx
// original — reads .formatted from unformatted array
const rows = sortedBalances.map((balance: FormattedWalletBalance) => ...)

// fix — one unified pipeline: filter → sort → format, then render that result
```

**4. `classes.row` — undefined reference (High)**
`classes` is never imported or defined. This causes a `ReferenceError` at render time, crashing every row.

**5. `prices[currency]` — potential `NaN` (High)**
When a currency has no price entry, `undefined * amount` produces `NaN`, which renders in the UI as "NaN".

```tsx
// original
const usdValue = prices[balance.currency] * balance.amount;

// fix
const price = prices[currency];
const usdValue = price != null ? price * amount : 0;
```

**6. Sort comparator missing `return 0` (Medium)**
When two chains share the same priority, the comparator returns nothing (`undefined`). `Array.sort` requires a numeric return value; the equal case must explicitly return `0`.

```tsx
// original — undefined when equal
if (leftPriority > rightPriority) return -1;
else if (rightPriority > leftPriority) return 1;

// fix — one expression handles all cases
return rightPriority - leftPriority;
```

**7. `toFixed()` — default 0 decimal places (Low–Medium)**
`amount.toFixed()` rounds to an integer string. Crypto balances like `0.0009` display as `"0"`.

```tsx
// fix
amount.toFixed(4);
```

---

### TypeScript issues

**8. `WalletBalance` missing `blockchain` field (Critical)**
The interface declares only `currency` and `amount`, but every filter/sort call reads `balance.blockchain`. Under strict TypeScript this is a compile error; without strict it silently passes `undefined` to `getPriority`.

**9. `any` on `getPriority` parameter (Medium)**
`(blockchain: any)` disables type checking. A typo in a chain name is invisible to the compiler.

**10. Type lie on `rows` map (Medium)**
`rows` annotates its callback parameter as `FormattedWalletBalance`, but the actual source (`sortedBalances`) is `WalletBalance[]`. The annotation suppresses the error while hiding the real bug.

**11. `FormattedWalletBalance` — duplicated fields, missing `blockchain` (Medium)**
The interface re-declares `currency` and `amount` instead of extending `WalletBalance`, and omits `blockchain`.

**12. Empty `interface Props extends BoxProps {}` (Low)**
An empty extension adds indirection with no benefit. Additionally, spreading `BoxProps` (a MUI type) onto a native `<div>` can produce invalid DOM attributes and silent styling failures.

---

### React anti-patterns

**13. `useMemo` dependency array includes unused `prices` (Medium)**
The memo callback only reads `balances`; `prices` is never used inside it. Adding `prices` causes the expensive filter+sort to re-run on every price tick, which in a crypto app can be every few seconds.

```tsx
// original — re-sorts on every price update
}, [balances, prices]);

// fix
}, [balances]);
```

**14. `key={index}` (Medium)**
Array index as a React key breaks reconciliation when the list is reordered or filtered. React reuses the wrong component instance, causing state and DOM to be associated with the wrong row.

```tsx
// fix
key={`${balance.blockchain}-${balance.currency}`}
```

**15. `children` destructured but never rendered (Medium)**
`const { children, ...rest } = props` removes `children` from `rest`, so any children passed by a parent are silently discarded.

**16. `React.FC` — outdated pattern (Low)**
`React.FC` implicitly adds `children?: ReactNode` and is no longer recommended. A plain typed function is clearer and better with generics.

---

### Performance / Maintainability

**`getPriority` declared inside the component**
A pure function that doesn't close over props or state gets recreated on every render. It should live at module scope where it is stable, testable, and reusable without `useCallback`.

**Dead `formattedBalances` variable**
The variable is computed with an O(n) `.map()` on every render but never used. Merged into the memoized pipeline, this work only runs when `balances` changes.

---

## How it was improved

| Original issue               | Fix in `main.tsx`                                                        |
| ---------------------------- | ------------------------------------------------------------------------ |
| `lhsPriority` crash          | Correct variable name; extract `isSupportedBlockchain` predicate         |
| Inverted filter              | `amount > 0` check via `hasPositiveBalance` predicate                    |
| Wrong map source             | Unified `buildFormattedBalances` pipeline: filter → sort → format        |
| `classes` crash              | `const ROW_CLASS_NAME = "wallet-row"` constant                           |
| NaN USD                      | `toUsdValue` with `price == null` guard                                  |
| Sort missing `return 0`      | `compareByBlockchainPriority`: `return right - left`                     |
| `toFixed()`                  | `toFixed(DISPLAY_DECIMALS)` with named constant `4`                      |
| Missing `blockchain` type    | Added to `WalletBalance`; `FormattedWalletBalance extends WalletBalance` |
| `any` parameter              | `Blockchain` union type + `Record<Blockchain, number>` map               |
| Type lie                     | Inferred from correct pipeline output                                    |
| `prices` in memo deps        | `useMemo(..., [balances])` only                                          |
| `key={index}`                | `key={\`${blockchain}-${currency}\`}`                                    |
| Children swallowed           | `{children}` rendered explicitly                                         |
| `React.FC` + empty interface | Plain `function WalletPage(props: WalletPageProps)`                      |
| `getPriority` in body        | Module-scope pure functions; no `useCallback` needed                     |
| Dead `formattedBalances`     | Merged into `buildFormattedBalances` inside `useMemo`                    |

---

## Correct data pipeline

```
useWalletBalances()
  │
  └─► useMemo [balances]:
        filter (supported blockchain && amount > 0)
        → sort (priority descending)
        → map  (add formatted string)
  │
  └─► render map:
        toUsdValue(amount, currency, prices)   ← reads prices here, not in memo
        <WalletRow key={blockchain-currency} ... />
```

USD is calculated in the render map (not inside `useMemo`) so that price updates are reflected immediately without re-running the sort.
