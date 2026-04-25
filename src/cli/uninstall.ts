import {
  existsSync,
  readFileSync,
  writeFileSync,
  rmSync,
  unlinkSync,
} from "node:fs";
import { resolve } from "node:path";
import { uninstallSkills } from "./install-skills.js";

export function runUninstall(cwd: string): void {
  // Step 1: Remove .focus/ directory
  const focusDir = resolve(cwd, ".focus");
  if (existsSync(focusDir)) {
    rmSync(focusDir, { recursive: true, force: true });
    console.log("Removed .focus/");
  } else {
    console.log(".focus/ not found — skipping.");
  }

  // Step 2: Remove NILAI.md
  const nilaiPath = resolve(cwd, "NILAI.md");
  if (existsSync(nilaiPath)) {
    unlinkSync(nilaiPath);
    console.log("Removed NILAI.md");
  } else {
    console.log("NILAI.md not found — skipping.");
  }

  // Step 3: Remove @NILAI.md reference from CLAUDE.md
  const claudePath = resolve(cwd, "CLAUDE.md");
  if (existsSync(claudePath)) {
    const content = readFileSync(claudePath, "utf-8");
    if (content.includes("@NILAI.md")) {
      const updated = content
        .split("\n")
        .filter((line) => line.trim() !== "@NILAI.md")
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trimEnd() + "\n";
      writeFileSync(claudePath, updated, "utf-8");
      console.log("Removed @NILAI.md reference from CLAUDE.md");
    } else {
      console.log("CLAUDE.md has no @NILAI.md reference — skipping.");
    }
  }

  // Step 4: Remove Nilai entries from .gitignore
  const gitignorePath = resolve(cwd, ".gitignore");
  const gitignoreRemovals = [".focus/", ".claude/skills/focus*/", "LATER.md"];
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, "utf-8");
    const hasEntries = gitignoreRemovals.some((e) => content.includes(e));
    if (hasEntries) {
      const updated = content
        .split("\n")
        .filter((line) => !gitignoreRemovals.includes(line.trim()))
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trimEnd() + "\n";
      writeFileSync(gitignorePath, updated, "utf-8");
      console.log("Removed Nilai entries from .gitignore");
    }
  }

  // Step 5: Remove hooks from .claude/settings.json
  const settingsPath = resolve(cwd, ".claude", "settings.json");
  if (existsSync(settingsPath)) {
    const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
    const events = ["UserPromptSubmit", "SessionStart", "PostToolUse", "Stop"];
    let removed = false;

    for (const event of events) {
      const entries = settings.hooks?.[event];
      if (Array.isArray(entries)) {
        const filtered = entries.filter(
          (entry: Record<string, unknown>) =>
            !(entry.hooks as Array<Record<string, string>>)?.some(
              (h) => h.command?.includes("nilai-hook"),
            ),
        );
        if (filtered.length !== entries.length) {
          settings.hooks[event] = filtered;
          removed = true;
        }
      }
    }

    if (removed) {
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
      console.log("Removed Nilai hooks from .claude/settings.json");
    } else {
      console.log("No Nilai hooks found — skipping.");
    }
  }

  // Step 6: Remove skill files
  console.log("");
  uninstallSkills(cwd);

  console.log("\nNilai has been uninstalled.");
}
