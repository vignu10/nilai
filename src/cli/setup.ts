import { runInit } from "./init.js";
import { runInstallHooks } from "./install-hooks.js";

export function runSetup(cwd: string): void {
  // Step 1: init (creates .focus/, NILAI.md, CLAUDE.md, skills)
  console.log("=== Step 1: Initializing Nilai ===\n");
  runInit(cwd);

  // Step 2: install hooks
  console.log("\n=== Step 2: Installing hooks ===\n");
  runInstallHooks(cwd);

  console.log("\nNilai is ready. Start a Claude Code session and tell it what you're working on.");
}
