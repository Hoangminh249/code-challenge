# Problem 2 — Currency Swap Form

Ứng dụng swap token với giá thật từ Switcheo, UI/UX theo chuẩn DeFi, validation đầy đủ và mock backend để demo loading/success/error.

## Chạy dự án

```bash
cd src/problem2
npm install
# Nếu gặp lỗi esbuild postinstall trên Windows: npm install --ignore-scripts && node node_modules/esbuild/install.js
npm run dev       # http://localhost:5173
npm test          # vitest (6 tests)
npm run build
npm run typecheck
```

Yêu cầu Node 20+.

## Stack & WHY

| Công nghệ | Lý do chọn |
|-----------|------------|
| **Vite + React + TS** | Đề bài prefer Vite; strict typing bắt lỗi giá/token sớm |
| **Tailwind + CSS variables** | Design token nhỏ, dễ theme, ship UI nhanh mà vẫn kiểm soát |
| **TanStack Query** | Server-state (price feed): cache, retry, stale, refetch |
| **react-hook-form + zod** | Validation declarative, ít re-render |
| **decimal.js** | Tránh lỗi float (`0.1 + 0.2`) khi tính quote |
| **Radix Dialog + cmdk** | Token picker accessible (focus trap, keyboard) |
| **sonner** | Toast success/error với Retry |

**Không dùng Zustand/Context** — scope 1 trang, state local + Query đủ.

## API & dữ liệu

- **Giá:** `https://interview.switcheo.com/prices.json`
- **Icon:** `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg`
- **Balance:** mock deterministic theo symbol (demo insufficient balance)
- **Swap:** `mockSwap()` — delay 1.2s, 5% fail rate, toast Retry

## Feature checklist

| Yêu cầu | Vị trí |
|---------|--------|
| Send / receive inputs | `AssetPanel.tsx`, `AmountInput.tsx` |
| Live exchange rate | `lib/swapRate.ts`, `RateLine.tsx` |
| Token icons | `TokenIcon.tsx`, `lib/tokenIcon.ts` |
| Loại token không có giá | `lib/normalizePrices.ts` |
| Validation | `lib/swapFormSchema.ts`, `SwapCard.tsx` |
| Simulate backend | `lib/mockSwap.ts` |
| Beautiful / intuitive UI | Tailwind tokens, dynamic CTA, MAX, swap direction |

## UX highlights

- Receive amount **read-only** — tránh sync 2 chiều phức tạp
- Nút Submit **nói lý do** khi disabled (`Insufficient USDC balance`, không chỉ xám)
- MAX fill balance; swap direction giữ amount
- Picker disable token phía đối diện
- Skeleton khi load giá; banner + Retry khi API fail

## Assumptions

1. Balance mock in-memory, reproducible giữa reload
2. Mock swap fail 5% — đủ demo error path
3. Duplicate symbol trong feed → giữ bản `date` mới nhất
4. Price ≤ 0 bị loại
5. Hiển thị tối đa 6 chữ số thập phân; math nội bộ 40-digit
6. Icon alias cho casing (`stEVMOS` → `STEVMOS`); fallback chữ cái khi 404

## Cấu trúc thư mục

```
src/problem2/
├─ src/
│  ├─ api/prices.ts
│  ├─ components/
│  ├─ hooks/
│  ├─ lib/
│  ├─ types/
│  ├─ constants/
│  ├─ styles/
│  └─ test/
├─ package.json
└─ README.md
```

## Checklist trước khi nộp (top 5%)

- [ ] `npm run build` pass
- [ ] `npm test` pass
- [ ] Test flow: nhập amount → quote live → confirm → success toast
- [ ] Test insufficient balance (nhập > balance)
- [ ] Test API error (offline) → banner Retry
- [ ] Test token picker keyboard + search
- [ ] Mobile 390px — tap targets đủ lớn
- [ ] Giải thích được WHY từng quyết định trong phỏng vấn
