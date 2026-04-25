import { describe, it, expect, vi } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
}));

import { handleFocusCheck } from "./focus_check.js";
import { readSession } from "../state/session.js";

describe("handleFocusCheck", () => {
  it("returns prompt to start when no session", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusCheck("/project", {
      intended_action: "Edit auth.ts",
    });
    expect(result.content[0].text).toContain("No active focus session");
  });

  it("returns task context and judgment instruction", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      task: "Add retry logic",
      done_criteria: ["Retries on 401", "Tests pass"],
      status: "active",
    } as any);

    const result = await handleFocusCheck("/project", {
      intended_action: "Refactor the middleware",
    });
    const text = result.content[0].text;
    expect(text).toContain("Current task: Add retry logic");
    expect(text).toContain("Retries on 401");
    expect(text).toContain("Refactor the middleware");
    expect(text).toContain("Judge whether");
  });
});
