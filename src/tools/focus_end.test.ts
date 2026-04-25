import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
  writeSession: vi.fn(),
  deleteSession: vi.fn(),
}));

vi.mock("../state/history.js", () => ({
  archiveSession: vi.fn(),
}));

import { handleFocusEnd } from "./focus_end.js";
import { readSession, writeSession, deleteSession } from "../state/session.js";
import { archiveSession } from "../state/history.js";

describe("handleFocusEnd", () => {
  beforeEach(() => {
    vi.mocked(readSession).mockReset();
    vi.mocked(writeSession).mockReset();
    vi.mocked(deleteSession).mockReset();
    vi.mocked(archiveSession).mockReset();
  });

  it("returns error when no session", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusEnd("/project");
    expect(result.content[0].text).toContain("No active focus session");
  });

  it("ends session and generates retro", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "20260425-120000",
      task: "Add retry logic",
      done_criteria: ["Retries on 401", "Tests pass"],
      time_box_minutes: 30,
      started_at: new Date(Date.now() - 20 * 60_000).toISOString(),
      milestones: [{ at: "...", text: "Added retry on 401 to login endpoint" }],
      parked_count: 1,
      status: "active",
    } as any);
    vi.mocked(writeSession).mockResolvedValueOnce();
    vi.mocked(archiveSession).mockResolvedValueOnce();
    vi.mocked(deleteSession).mockResolvedValueOnce();

    const result = await handleFocusEnd("/project");
    const text = result.content[0].text;

    // Retro contains the right info
    expect(text).toContain("Session retro: Add retry logic");
    expect(text).toContain("Milestones: 1");
    expect(text).toContain("Parked items: 1");

    // Status changed
    expect(writeSession).toHaveBeenCalled();
    const written = vi.mocked(writeSession).mock.calls[0][1];
    expect(written.status).toBe("ended");
    expect(written.ended_at).toBeDefined();

    // Archived and deleted
    expect(archiveSession).toHaveBeenCalled();
    expect(deleteSession).toHaveBeenCalled();
  });

  it("shows unfinished criteria", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      task: "Add retry logic",
      done_criteria: ["Retries on 401", "Tests pass for retry behavior"],
      time_box_minutes: 30,
      started_at: new Date(Date.now() - 10 * 60_000).toISOString(),
      milestones: [{ at: "...", text: "Completely unrelated milestone" }],
      parked_count: 0,
      status: "active",
    } as any);
    vi.mocked(writeSession).mockResolvedValueOnce();
    vi.mocked(archiveSession).mockResolvedValueOnce();
    vi.mocked(deleteSession).mockResolvedValueOnce();

    const result = await handleFocusEnd("/project");
    const text = result.content[0].text;
    expect(text).toContain("Unfinished criteria");
  });
});
