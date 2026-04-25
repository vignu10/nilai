import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
  writeSession: vi.fn(),
}));

import { handleFocusStart } from "./focus_start.js";
import { readSession, writeSession } from "../state/session.js";

const validArgs = {
  task: "Add retry logic to login endpoint",
  done_criteria: ["Endpoint retries on transient 401", "Backoff is exponential", "Tests pass for retry behavior"],
  time_box_minutes: 45,
};

describe("handleFocusStart", () => {
  beforeEach(() => {
    vi.mocked(readSession).mockReset();
    vi.mocked(writeSession).mockReset();
  });

  it("rejects when session already active", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "existing",
      task: "old task",
      status: "active",
    } as any);

    const result = await handleFocusStart("/project", validArgs);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Session already active");
  });

  it("rejects vague tasks", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusStart("/project", {
      ...validArgs,
      task: "improve the codebase",
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("vague");
  });

  it("rejects short done criteria", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusStart("/project", {
      ...validArgs,
      done_criteria: ["works"],
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("too vague");
  });

  it("creates session with default medium intensity", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);
    vi.mocked(writeSession).mockResolvedValueOnce();

    const result = await handleFocusStart("/project", validArgs);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Intensity: medium");
    expect(writeSession).toHaveBeenCalled();

    const written = vi.mocked(writeSession).mock.calls[0][1];
    expect(written.intensity).toBe("medium");
    expect(written.status).toBe("active");
  });

  it("creates session with explicit intensity", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);
    vi.mocked(writeSession).mockResolvedValueOnce();

    const result = await handleFocusStart("/project", { ...validArgs, intensity: "high" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Intensity: high");

    const written = vi.mocked(writeSession).mock.calls[0][1];
    expect(written.intensity).toBe("high");
  });
});
