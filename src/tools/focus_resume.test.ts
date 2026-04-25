import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
  writeSession: vi.fn(),
}));

vi.mock("../state/history.js", () => ({
  readHistory: vi.fn(),
}));

import { handleFocusResume } from "./focus_resume.js";
import { readSession, writeSession } from "../state/session.js";
import { readHistory } from "../state/history.js";

describe("handleFocusResume", () => {
  beforeEach(() => {
    vi.mocked(readSession).mockReset();
    vi.mocked(writeSession).mockReset();
    vi.mocked(readHistory).mockReset();
  });

  it("rejects when session already active", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "current",
      task: "current task",
      status: "active",
    } as any);

    const result = await handleFocusResume("/project", { session_id: "old" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Session already active");
  });

  it("rejects invalid session ID", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);
    vi.mocked(readHistory).mockResolvedValueOnce(null);

    const result = await handleFocusResume("/project", { session_id: "nonexistent" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("No archived session");
  });

  it("creates new session from archived data", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);
    vi.mocked(readHistory).mockResolvedValueOnce({
      id: "20260425-100000",
      task: "Add retry logic",
      done_criteria: ["Retries on 401"],
      time_box_minutes: 30,
      intensity: "high",
      started_at: "2026-04-25T10:00:00.000Z",
      milestones: [{ at: "...", text: "Added retry" }],
      parked_count: 2,
      status: "ended",
      ended_at: "2026-04-25T10:30:00.000Z",
    } as any);
    vi.mocked(writeSession).mockResolvedValueOnce();

    const result = await handleFocusResume("/project", { session_id: "20260425-100000" });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Resumed");
    expect(result.content[0].text).toContain("Add retry logic");
    expect(result.content[0].text).toContain("carried over");

    const written = vi.mocked(writeSession).mock.calls[0][1];
    expect(written.task).toBe("Add retry logic");
    expect(written.milestones).toHaveLength(1);
    expect(written.status).toBe("active");
    expect(written.id).not.toBe("20260425-100000");
    expect(written.intensity).toBe("high");
  });
});
