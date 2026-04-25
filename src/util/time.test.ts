import { describe, it, expect, vi } from "vitest";
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
  it("warns when over time box", () => {
    const now = new Date();
    const started = new Date(now.getTime() - 35 * 60_000);
    const result = getNudge(started.toISOString(), 30, 1);
    expect(result).toContain("5 minutes over");
    expect(result).toContain("30min time box");
  });

  it("warns when within 10% of time box", () => {
    const now = new Date();
    // 28 of 30 minutes used (within 10% = 3min remaining)
    const started = new Date(now.getTime() - 28 * 60_000);
    const result = getNudge(started.toISOString(), 30, 1);
    expect(result).toContain("Approaching");
  });

  it("warns when stalling (30% elapsed, 0 milestones)", () => {
    const now = new Date();
    const started = new Date(now.getTime() - 20 * 60_000);
    const result = getNudge(started.toISOString(), 60, 0);
    expect(result).toContain("no milestones");
  });

  it("shows normal status", () => {
    const now = new Date();
    const started = new Date(now.getTime() - 10 * 60_000);
    const result = getNudge(started.toISOString(), 60, 3);
    expect(result).toContain("10 of 60 minutes used");
    expect(result).toContain("3 milestones");
  });
});
