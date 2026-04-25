import { runInit } from "./init.js";
import { execSync } from "node:child_process";

export function runSetup(cwd: string): void {
  // Step 1: init
  console.log("=== Step 1: Initializing Nilai ===\n");
  runInit(cwd);

  // Step 2: register MCP server
  console.log("\n=== Step 2: Registering MCP server ===\n");
  try {
    execSync('claude mcp add nilai -- npx -y @vignu10/nilai-mcp', {
      stdio: "inherit",
    });
    console.log("MCP server registered.");
  } catch {
    console.log("Could not register MCP server. Run manually:");
    console.log("  claude mcp add nilai -- npx -y @vignu10/nilai-mcp");
  }

  // Step 3: install hooks
  console.log("\n=== Step 3: Installing hooks ===\n");
  runInstallHooks(cwd);

  console.log("\nNilai is ready. Start a Claude Code session and tell it what you're working on.");
}

import { runInstallHooks } from "./install-hooks.js";
