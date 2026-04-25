import { runInit } from "./cli/init.js";
import { runInstallHooks } from "./cli/install-hooks.js";
import { runSetup } from "./cli/setup.js";
import { runUninstall } from "./cli/uninstall.js";
import { runUpdate } from "./cli/update.js";

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
  case "update":
    runUpdate(cwd);
    break;
  case "uninstall":
    runUninstall(cwd);
    break;
  default:
    console.log("Nilai — ADHD-friendly focus sessions for Claude Code\n");
    console.log("Usage:");
    console.log(
      "  nilai init            Initialize Nilai in the current project",
    );
    console.log("  nilai install-hooks   Register Claude Code hooks");
    console.log(
      "  nilai setup           One-command setup (init + register MCP + hooks)",
    );
    console.log("  nilai update          Update hooks and NILAI.md to latest version");
    console.log("  nilai uninstall       Remove Nilai from the current project");
    process.exit(1);
}
