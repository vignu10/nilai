import { runInit } from "./cli/init.js";
import { runInstallHooks } from "./cli/install-hooks.js";
import { runSetup } from "./cli/setup.js";

const command = process.argv[2];
const cwd = process.cwd();

switch (command) {
  case "init":
    runInit(cwd);
    break;
  case "install-hooks":
    runInstallHooks(cwd);
    break;
  case "setup":
    runSetup(cwd);
    break;
  default:
    console.log("Nilai — ADHD-friendly focus sessions for Claude Code\n");
    console.log("Usage:");
    console.log(
      "  nilai init            Initialize Nilai in the current project",
    );
    console.log("  nilai install-hooks   Register UserPromptSubmit hook");
    console.log(
      "  nilai setup           One-command setup (init + register MCP + hooks)",
    );
    process.exit(1);
}
