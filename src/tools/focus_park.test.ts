import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
  writeSession: vi.fn(),
}));

vi.mock("../state/later.js", () => ({
  appendToLater: vi.fn(),
}));

import { handleFocusPark } from "./focus_park.js";
import { readSession, writeSession } from "../state/session.js";
import { appendToLater } from "../state/later.js";

describe("handleFocusPark", () => {
  beforeEach(() => {
    vi.mocked(readSession).mockReset();
    vi.mocked(writeSession).mockReset();
  });

  it("returns error when no session", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusPark("/project", { idea: "Fix header" });
    expect(result.content[0].text).toContain("No active focus session");
  });

  it("parks idea and increments count", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      task: "Add retry logic",
      parked_count: 0,
      status: "active",
    } as any);
    vi.mocked(writeSession).mockResolvedValueOnce();

    const result = await handleFocusPark("/project", {
      idea: "Fix header color",
      why_interesting: "Looks off in dark mode",
    });

    expect(appendToLater).toHaveBeenCalledWith(
      "/project",
      "Fix header color",
      "Looks off in dark mode",
    );
    expect(writeSession).toHaveBeenCalled();
    const written = vi.mocked(writeSession).mock.calls[0][1];
    expect(written.parked_count).toBe(1);
    expect(result.content[0].text).toContain("Parked");
    expect(result.content[0].text).toContain("1");
  });
});
