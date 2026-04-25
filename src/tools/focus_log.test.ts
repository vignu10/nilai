import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
  writeSession: vi.fn(),
}));

import { handleFocusLog } from "./focus_log.js";
import { readSession, writeSession } from "../state/session.js";

describe("handleFocusLog", () => {
  beforeEach(() => {
    vi.mocked(readSession).mockReset();
    vi.mocked(writeSession).mockReset();
  });

  it("returns error when no session", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusLog("/project", { milestone: "Did the thing" });
    expect(result.content[0].text).toContain("No active focus session");
  });

  it("rejects vague milestones", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      status: "active",
    } as any);

    const result = await handleFocusLog("/project", { milestone: "done" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("too vague");
  });

  it("appends milestone and returns confirmation", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      milestones: [],
      status: "active",
    } as any);
    vi.mocked(writeSession).mockResolvedValueOnce();

    const result = await handleFocusLog("/project", {
      milestone: "Added retry logic to login endpoint",
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Milestone logged");
    expect(writeSession).toHaveBeenCalled();

    const written = vi.mocked(writeSession).mock.calls[0][1];
    expect(written.milestones).toHaveLength(1);
    expect(written.milestones[0].text).toBe("Added retry logic to login endpoint");
  });
});
