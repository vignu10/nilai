import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInstallHooks } from "./install-hooks.js";
import { NILAI_MD } from "../templates/nilai-md.js";
import { installSkills } from "./install-skills.js";
import { ensureFocusDirs } from "../state/paths.js";

export function runUpdate(cwd: string): void {
  console.log("Updating Nilai...\n");

  // 1. Update hooks — re-registers all events (picks up new ones)
  runInstallHooks(cwd);
  console.log("");

  // 2. Update NILAI.md if it exists
  const nilaiPath = resolve(cwd, "NILAI.md");
  if (existsSync(nilaiPath)) {
    const current = readFileSync(nilaiPath, "utf-8");
    if (current !== NILAI_MD) {
      writeFileSync(nilaiPath, NILAI_MD, "utf-8");
      console.log("Updated NILAI.md with latest protocol.");
    } else {
      console.log("NILAI.md is already up to date.");
    }
  } else {
    writeFileSync(nilaiPath, NILAI_MD, "utf-8");
    console.log("Created NILAI.md.");
  }

  // 3. Ensure CLAUDE.md references NILAI.md
  const claudePath = resolve(cwd, "CLAUDE.md");
  const reference = "@NILAI.md";
  if (existsSync(claudePath)) {
    const content = readFileSync(claudePath, "utf-8");
    if (!content.includes(reference)) {
      appendFileSync(claudePath, `\n${reference}\n`, "utf-8");
      console.log("Appended @NILAI.md to CLAUDE.md");
    }
  } else {
    writeFileSync(claudePath, reference + "\n", "utf-8");
    console.log("Created CLAUDE.md with @NILAI.md reference");
  }

  // 4. Ensure .focus/ directory exists
  ensureFocusDirs(cwd);

  // 5. Update skill files
  console.log("");
  installSkills(cwd);

  console.log("\nUpdate complete. Restart your Claude Code session to pick up changes.");
}
