import { describe, it, expect, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
}));

vi.mock("./paths.js", () => ({
  historyDir: (cwd: string) => `${cwd}/.focus/history`,
  ensureFocusDirs: vi.fn(),
}));

import { archiveSession, readHistory, listHistory } from "./history.js";
import { readFile, writeFile, readdir } from "node:fs/promises";
import type { Session } from "./session.js";

const mockSession: Session = {
  id: "20260425-120000",
  task: "Add retry logic",
  done_criteria: ["Done"],
  time_box_minutes: 30,
  intensity: "medium",
  started_at: "2026-04-25T12:00:00.000Z",
  milestones: [],
  parked_count: 0,
  status: "ended",
  ended_at: "2026-04-25T12:30:00.000Z",
};

describe("archiveSession", () => {
  it("writes session to history file", async () => {
    vi.mocked(writeFile).mockResolvedValueOnce();
    await archiveSession("/project", mockSession);
    expect(writeFile).toHaveBeenCalledWith(
      "/project/.focus/history/20260425-120000.json",
      JSON.stringify(mockSession, null, 2),
      "utf-8",
    );
  });
});

describe("readHistory", () => {
  it("returns session when found", async () => {
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(mockSession));
    const result = await readHistory("/project", "20260425-120000");
    expect(result).toEqual(mockSession);
  });

  it("returns null when not found", async () => {
    vi.mocked(readFile).mockRejectedValueOnce(new Error("ENOENT"));
    const result = await readHistory("/project", "nonexistent");
    expect(result).toBeNull();
  });
});

describe("listHistory", () => {
  it("returns empty array when directory missing", async () => {
    vi.mocked(readdir).mockRejectedValueOnce(new Error("ENOENT"));
    const result = await listHistory("/project");
    expect(result).toEqual([]);
  });

  it("returns sessions sorted by ID descending", async () => {
    const older: Session = { ...mockSession, id: "20260425-100000" };
    const newer: Session = { ...mockSession, id: "20260425-140000" };

    vi.mocked(readdir).mockResolvedValueOnce([
      "20260425-120000.json",
      "20260425-140000.json",
      "20260425-100000.json",
    ] as any);
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify(mockSession))
      .mockResolvedValueOnce(JSON.stringify(newer))
      .mockResolvedValueOnce(JSON.stringify(older));

    const result = await listHistory("/project");
    expect(result[0].id).toBe("20260425-140000");
    expect(result[2].id).toBe("20260425-100000");
  });

  it("skips corrupted JSON files", async () => {
    vi.mocked(readdir).mockResolvedValueOnce([
      "20260425-120000.json",
      "bad.json",
    ] as any);
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify(mockSession))
      .mockResolvedValueOnce("not json{{{");

    const result = await listHistory("/project");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("20260425-120000");
  });

  it("ignores non-JSON files", async () => {
    vi.mocked(readdir).mockResolvedValueOnce([
      "20260425-120000.json",
      "notes.txt",
    ] as any);
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(mockSession));

    const result = await listHistory("/project");
    expect(result).toHaveLength(1);
  });
});
