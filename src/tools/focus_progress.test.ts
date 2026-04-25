import { describe, it, expect, vi } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
}));

import { handleFocusProgress } from "./focus_progress.js";
import { readSession } from "../state/session.js";

describe("handleFocusProgress", () => {
  it("returns error when no session", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusProgress("/project");
    expect(result.content[0].text).toContain("No active focus session");
  });

  it("shows unchecked criteria when no milestones match", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      done_criteria: ["Retries on 401", "Tests pass"],
      milestones: [],
      status: "active",
    } as any);

    const result = await handleFocusProgress("/project");
    const text = result.content[0].text;
    expect(text).toContain("[ ] Retries on 401");
    expect(text).toContain("[ ] Tests pass");
    expect(text).toContain("(none yet)");
  });

  it("checks off matched criteria", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      done_criteria: ["Retries on transient 401 errors", "Tests pass for retry behavior"],
      milestones: [
        { at: "...", text: "Added retries on transient 401 errors to login endpoint" },
        { at: "...", text: "Wrote tests for retry behavior in login" },
      ],
      status: "active",
    } as any);

    const result = await handleFocusProgress("/project");
    const text = result.content[0].text;
    expect(text).toContain("[x] Retries on transient 401 errors");
    expect(text).toContain("[x] Tests pass for retry behavior");
  });
});
