import { describe, it, expect, vi } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
}));

import { handleFocusPulse } from "./focus_pulse.js";
import { readSession } from "../state/session.js";

describe("handleFocusPulse", () => {
  it("returns error when no session", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusPulse("/project");
    expect(result.content[0].text).toContain("No active focus session");
  });

  it("returns task with time info and nudge", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      task: "Add retry logic",
      time_box_minutes: 30,
      started_at: new Date(Date.now() - 10 * 60_000).toISOString(),
      milestones: [{ at: "...", text: "something" }],
      intensity: "medium",
      status: "active",
    } as any);

    const result = await handleFocusPulse("/project");
    const text = result.content[0].text;
    expect(text).toContain("Add retry logic");
    expect(text).toContain("10m of 30m");
  });

  it("uses intensity-aware nudges for high mode", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      task: "Add retry logic",
      time_box_minutes: 30,
      started_at: new Date(Date.now() - 23 * 60_000).toISOString(),
      milestones: [],
      intensity: "high",
      status: "active",
    } as any);

    const result = await handleFocusPulse("/project");
    const text = result.content[0].text;
    expect(text).toContain("Approaching");
  });
});
