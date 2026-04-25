import { describe, it, expect, vi } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
}));

import { handleFocusStatus } from "./focus_status.js";
import { readSession } from "../state/session.js";

describe("handleFocusStatus", () => {
  it("returns no session message when inactive", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusStatus("/project");
    expect(result.content[0].text).toBe("No active focus session.");
  });

  it("returns session details when active", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "20260425-120000",
      task: "Add retry logic",
      done_criteria: ["Retries on 401"],
      time_box_minutes: 30,
      started_at: new Date(Date.now() - 10 * 60_000).toISOString(),
      milestones: [{ at: "...", text: "Added retry" }],
      parked_count: 2,
      status: "active",
    } as any);

    const result = await handleFocusStatus("/project");
    const text = result.content[0].text;
    expect(text).toContain("Add retry logic");
    expect(text).toContain("Milestones: 1");
    expect(text).toContain("Parked: 2");
    expect(text).toContain("Retries on 401");
  });
});
