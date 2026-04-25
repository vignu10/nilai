import { describe, it, expect } from "vitest";
import { isVagueTask } from "./vague.js";

describe("isVagueTask", () => {
  it("rejects vague verbs at start", () => {
    for (const verb of [
      "improve the login flow",
      "enhance error handling",
      "refactor the auth module",
      "look into the bug",
      "explore the API",
      "investigate the failure",
      "polish the UI",
      "clean up the tests",
      "review the PR",
      "consider using Redis",
      "think about the architecture",
      "understand the codebase",
      "figure out the bug",
      "work on the feature",
      "deal with the error",
      "handle the edge case",
    ]) {
      const result = isVagueTask(verb);
      expect(result.vague, `"${verb}" should be vague`).toBe(true);
    }
  });

  it("rejects vague nouns", () => {
    const result = isVagueTask("Fix stuff in the codebase");
    expect(result.vague).toBe(true);
    expect(result.reasons.some((r) => r.includes("vague noun"))).toBe(true);
  });

  it("rejects tasks under 4 words", () => {
    const result = isVagueTask("fix bug");
    expect(result.vague).toBe(true);
    expect(result.reasons.some((r) => r.includes("fewer than 4"))).toBe(true);
  });

  it("catches mixed-case vague verbs", () => {
    const result = isVagueTask("Improve the app");
    expect(result.vague).toBe(true);
  });

  it("passes concrete tasks", () => {
    const tasks = [
      "Add retry logic to the login API endpoint",
      "Fix null pointer exception in user service",
      "Remove deprecated legacy auth middleware",
      "Change timeout from 5s to 30s in config",
    ];
    for (const task of tasks) {
      const result = isVagueTask(task);
      expect(result.vague, `"${task}" should not be vague`).toBe(false);
    }
  });

  it("passes exactly 4 words", () => {
    const result = isVagueTask("Add login page tests");
    expect(result.vague).toBe(false);
  });

  it("includes a hint on rejection", () => {
    const result = isVagueTask("improve stuff");
    expect(result.vague).toBe(true);
    expect(result.hint).toContain("concrete verb");
  });
});
