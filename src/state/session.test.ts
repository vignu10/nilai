import { describe, it, expect, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
}));

vi.mock("./paths.js", () => ({
  sessionPath: (cwd: string) => `${cwd}/.focus/session.json`,
  ensureFocusDirs: vi.fn(),
}));

import { readSession, writeSession, deleteSession, assertActive } from "./session.js";
import type { Session } from "./session.js";
import { readFile, writeFile, unlink } from "node:fs/promises";

const mockSession: Session = {
  id: "20260425-120000",
  task: "Add retry logic to login endpoint",
  done_criteria: ["Endpoint retries on 401", "Tests pass"],
  time_box_minutes: 30,
  intensity: "medium",
  started_at: "2026-04-25T12:00:00.000Z",
  milestones: [],
  parked_count: 0,
  status: "active",
};

describe("readSession", () => {
  it("returns parsed session when file exists", async () => {
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(mockSession));
    const result = await readSession("/project");
    expect(result).toEqual(mockSession);
  });

  it("returns null when file does not exist", async () => {
    vi.mocked(readFile).mockRejectedValueOnce(new Error("ENOENT"));
    const result = await readSession("/project");
    expect(result).toBeNull();
  });

  it("returns null for malformed JSON", async () => {
    vi.mocked(readFile).mockResolvedValueOnce("not json{{{");
    const result = await readSession("/project");
    expect(result).toBeNull();
  });
});

describe("writeSession", () => {
  it("writes session as JSON", async () => {
    vi.mocked(writeFile).mockResolvedValueOnce();
    await writeSession("/project", mockSession);
    expect(writeFile).toHaveBeenCalledWith(
      "/project/.focus/session.json",
      JSON.stringify(mockSession, null, 2),
      "utf-8",
    );
  });
});

describe("deleteSession", () => {
  it("deletes the file", async () => {
    vi.mocked(unlink).mockResolvedValueOnce();
    await deleteSession("/project");
    expect(unlink).toHaveBeenCalledWith("/project/.focus/session.json");
  });

  it("does not throw when file is missing", async () => {
    vi.mocked(unlink).mockRejectedValueOnce(new Error("ENOENT"));
    await expect(deleteSession("/project")).resolves.toBeUndefined();
  });
});

describe("assertActive", () => {
  it("throws when session is null", () => {
    expect(() => assertActive(null)).toThrow("No active focus session");
  });

  it("throws when session is ended", () => {
    const ended = { ...mockSession, status: "ended" as const };
    expect(() => assertActive(ended)).toThrow("No active focus session");
  });

  it("returns the session when active", () => {
    expect(assertActive(mockSession)).toBe(mockSession);
  });
});
