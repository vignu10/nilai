import { readFile, writeFile } from "node:fs/promises";
import { laterPath } from "./paths.js";

export async function appendToLater(
  cwd: string,
  idea: string,
  why?: string,
): Promise<void> {
  const path = laterPath(cwd);
  const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");

  const entry = [
    `## ${timestamp}`,
    `**Idea:** ${idea}`,
    why ? `**Why:** ${why}` : null,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  let existing = "";
  try {
    existing = await readFile(path, "utf-8");
  } catch {
    existing = "# LATER\n\nParked ideas — recency-first.\n\n---\n\n";
  }

  // Insert after the header section (after the first "---")
  const firstSep = existing.indexOf("\n---\n");
  if (firstSep === -1) {
    await writeFile(path, existing + "\n" + entry + "\n", "utf-8");
  } else {
    const before = existing.slice(0, firstSep + 5);
    const after = existing.slice(firstSep + 5);
    await writeFile(path, before + "\n" + entry + "\n" + after, "utf-8");
  }
}

export async function readLater(cwd: string): Promise<string | null> {
  const path = laterPath(cwd);
  try {
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}
