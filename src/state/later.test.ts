import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("./paths.js", () => ({
  laterPath: (cwd: string) => `${cwd}/LATER.md`,
}));

import { appendToLater, readLater } from "./later.js";
import { readFile, writeFile } from "node:fs/promises";

describe("appendToLater", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates file with header when none exists", async () => {
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await appendToLater("/project", "Fix header color", "Looks wrong on dark mode");

    expect(writeFile).toHaveBeenCalled();
    const written = vi.mocked(writeFile).mock.calls[0][1] as string;
    expect(written).toContain("Fix header color");
    expect(written).toContain("Looks wrong on dark mode");
    expect(written).toContain("# LATER");
  });

  it("prepends new entry before existing entries", async () => {
    const existing = "# LATER\n\nParked ideas — recency-first.\n\n---\n\n## 2026-04-20 10:00\n**Idea:** something old\n---\n";
    vi.mocked(readFile).mockResolvedValue(existing);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await appendToLater("/project", "New idea");

    const written = vi.mocked(writeFile).mock.calls[0][1] as string;
    const newIdx = written.indexOf("New idea");
    const oldIdx = written.indexOf("something old");
    expect(newIdx).toBeGreaterThan(-1);
    expect(oldIdx).toBeGreaterThan(-1);
    expect(newIdx).toBeLessThan(oldIdx);
  });

  it("omits why when not provided", async () => {
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await appendToLater("/project", "Some idea");

    const written = vi.mocked(writeFile).mock.calls[0][1] as string;
    expect(written).toContain("**Idea:** Some idea");
    expect(written).not.toContain("**Why:**");
  });
});

describe("readLater", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns file content", async () => {
    vi.mocked(readFile).mockResolvedValue("# LATER\ncontent");
    const result = await readLater("/project");
    expect(result).toBe("# LATER\ncontent");
  });

  it("returns null when file missing", async () => {
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
    const result = await readLater("/project");
    expect(result).toBeNull();
  });
});
