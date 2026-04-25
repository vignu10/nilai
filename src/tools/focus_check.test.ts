import { describe, it, expect, vi } from "vitest";

vi.mock("../state/session.js", () => ({
  readSession: vi.fn(),
}));

import { handleFocusCheck } from "./focus_check.js";
import { readSession } from "../state/session.js";

describe("handleFocusCheck", () => {
  it("returns prompt to start when no session", async () => {
    vi.mocked(readSession).mockResolvedValueOnce(null);

    const result = await handleFocusCheck("/project", {
      intended_action: "Edit auth.ts",
    });
    expect(result.content[0].text).toContain("No active focus session");
  });

  it("returns soft instruction for low intensity", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      task: "Add retry logic",
      done_criteria: ["Retries on 401"],
      intensity: "low",
      status: "active",
    } as any);

    const result = await handleFocusCheck("/project", {
      intended_action: "Refactor the middleware",
    });
    const text = result.content[0].text;
    expect(text).toContain("Soft check");
    expect(text).toContain("no pressure");
  });

  it("returns medium instruction by default", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      task: "Add retry logic",
      done_criteria: ["Retries on 401"],
      intensity: "medium",
      status: "active",
    } as any);

    const result = await handleFocusCheck("/project", {
      intended_action: "Refactor the middleware",
    });
    const text = result.content[0].text;
    expect(text).toContain("Judge whether");
    expect(text).toContain("propose focus_park");
  });

  it("returns strict instruction for high intensity", async () => {
    vi.mocked(readSession).mockResolvedValueOnce({
      id: "test",
      task: "Add retry logic",
      done_criteria: ["Retries on 401"],
      intensity: "high",
      status: "active",
    } as any);

    const result = await handleFocusCheck("/project", {
      intended_action: "Refactor the middleware",
    });
    const text = result.content[0].text;
    expect(text).toContain("STRICT MODE");
    expect(text).toContain("Do NOT act");
    expect(text).toContain("No exceptions");
  });
});
