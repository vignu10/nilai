import { describe, it, expect } from "vitest";
import {
  formatElapsed,
  formatRemaining,
  elapsedMinutes,
  getNudge,
} from "./time.js";

describe("formatElapsed", () => {
  it("formats minutes under 60", () => {
    const now = new Date();
    const started = new Date(now.getTime() - 25 * 60_000);
    const result = formatElapsed(started.toISOString());
    expect(result).toBe("25m");
  });

  it("formats hours and minutes", () => {
    const now = new Date();
    const started = new Date(now.getTime() - 90 * 60_000);
    const result = formatElapsed(started.toISOString());
    expect(result).toBe("1h 30m");
  });

  it("formats exact hours", () => {
    const now = new Date();
    const started = new Date(now.getTime() - 120 * 60_000);
    const result = formatElapsed(started.toISOString());
    expect(result).toBe("2h");
  });
});

describe("formatRemaining", () => {
  it("returns positive remaining minutes", () => {
    const now = new Date();
    const started = new Date(now.getTime() - 10 * 60_000);
    expect(formatRemaining(started.toISOString(), 30)).toBe(20);
  });

  it("returns 0 when over budget", () => {
    const now = new Date();
    const started = new Date(now.getTime() - 60 * 60_000);
    expect(formatRemaining(started.toISOString(), 30)).toBe(0);
  });
});

describe("elapsedMinutes", () => {
  it("returns accurate minutes", () => {
    const now = new Date();
    const started = new Date(now.getTime() - 47 * 60_000);
    expect(elapsedMinutes(started.toISOString())).toBe(47);
  });
});

describe("getNudge", () => {
  describe("medium (default)", () => {
    it("warns when over time box", () => {
      const now = new Date();
      const started = new Date(now.getTime() - 35 * 60_000);
      const result = getNudge(started.toISOString(), 30, 1);
      expect(result).toContain("5 minutes over");
    });

    it("warns when within 10% of time box", () => {
      const now = new Date();
      const started = new Date(now.getTime() - 28 * 60_000);
      const result = getNudge(started.toISOString(), 30, 1);
      expect(result).toContain("Approaching");
    });

    it("warns when stalling at 30%", () => {
      const now = new Date();
      const started = new Date(now.getTime() - 20 * 60_000);
      const result = getNudge(started.toISOString(), 60, 0, "medium");
      expect(result).toContain("no milestones");
    });

    it("shows normal status", () => {
      const now = new Date();
      const started = new Date(now.getTime() - 10 * 60_000);
      const result = getNudge(started.toISOString(), 60, 3);
      expect(result).toContain("10 of 60 minutes used");
    });
  });

  describe("low intensity", () => {
    it("suppresses over-time warning when less than 50% over", () => {
      const now = new Date();
      // 5 over = 16.7% over — under 50% threshold
      const started = new Date(now.getTime() - 35 * 60_000);
      const result = getNudge(started.toISOString(), 30, 1, "low");
      expect(result).not.toContain("over");
    });

    it("warns when more than 50% over time box", () => {
      const now = new Date();
      // 20 over = 66% over — above 50% threshold
      const started = new Date(now.getTime() - 50 * 60_000);
      const result = getNudge(started.toISOString(), 30, 1, "low");
      expect(result).toContain("over");
    });

    it("only warns about stalling at 50% elapsed", () => {
      const now = new Date();
      // 20 of 60 = 33% — under 50% threshold, no stall warning
      const started20 = new Date(now.getTime() - 20 * 60_000);
      expect(getNudge(started20.toISOString(), 60, 0, "low")).not.toContain("no milestones");

      // 35 of 60 = 58% — above 50% threshold, stall warning
      const started35 = new Date(now.getTime() - 35 * 60_000);
      expect(getNudge(started35.toISOString(), 60, 0, "low")).toContain("no milestones");
    });
  });

  describe("high intensity", () => {
    it("warns when within 25% of time box", () => {
      const now = new Date();
      // 23 of 30 used, 7 remaining — within 25% (7.5min)
      const started = new Date(now.getTime() - 23 * 60_000);
      const result = getNudge(started.toISOString(), 30, 1, "high");
      expect(result).toContain("Approaching");
    });

    it("does not warn within 25% at medium", () => {
      const now = new Date();
      // 23 of 30 used, 7 remaining — NOT within 10% (3min) for medium
      const started = new Date(now.getTime() - 23 * 60_000);
      const result = getNudge(started.toISOString(), 30, 1, "medium");
      expect(result).not.toContain("Approaching");
    });

    it("warns about stalling at 15% elapsed", () => {
      const now = new Date();
      // 10 of 60 = 16.7% — above 15% threshold
      const started = new Date(now.getTime() - 10 * 60_000);
      const result = getNudge(started.toISOString(), 60, 0, "high");
      expect(result).toContain("no milestones");
    });

    it("does not warn about stalling at 15% for medium", () => {
      const now = new Date();
      // 10 of 60 = 16.7% — under 30% threshold for medium
      const started = new Date(now.getTime() - 10 * 60_000);
      const result = getNudge(started.toISOString(), 60, 0, "medium");
      expect(result).not.toContain("no milestones");
    });
  });
});
