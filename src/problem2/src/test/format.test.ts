import { describe, expect, it } from "vitest";
import { formatTimeAgo, formatUsd } from "@/lib/format";

describe("format", () => {
  it("formats usd values", () => {
    expect(formatUsd(12.5)).toBe("$12.50");
    expect(formatUsd("not-a-number")).toBe("—");
  });

  it("formats relative time", () => {
    const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString();
    expect(formatTimeAgo(tenSecondsAgo)).toBe("10s ago");
    expect(formatTimeAgo("")).toBe("just now");
  });
});
