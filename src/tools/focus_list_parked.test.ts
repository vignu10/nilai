import { describe, it, expect, vi } from "vitest";

vi.mock("../state/later.js", () => ({
  readLater: vi.fn(),
}));

import { handleFocusListParked } from "./focus_list_parked.js";
import { readLater } from "../state/later.js";

describe("handleFocusListParked", () => {
  it("returns message when no parked ideas", async () => {
    vi.mocked(readLater).mockResolvedValueOnce(null);

    const result = await handleFocusListParked("/project");
    expect(result.content[0].text).toBe("No parked ideas yet.");
  });

  it("returns LATER.md content", async () => {
    vi.mocked(readLater).mockResolvedValueOnce("# LATER\n\nsome ideas here");

    const result = await handleFocusListParked("/project");
    expect(result.content[0].text).toContain("some ideas here");
  });
});
