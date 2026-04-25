import { runInit } from "./cli/init.js";
import { runInstallHooks } from "./cli/install-hooks.js";
import { runSetup } from "./cli/setup.js";
import { runUninstall } from "./cli/uninstall.js";
import { runUpdate } from "./cli/update.js";
import { dispatch } from "./cli/dispatch.js";

const command = process.argv[2];
const cwd = process.cwd();

const FOCUS_COMMANDS = [
  "start", "quick", "status", "end", "resume",
  "check", "park", "log", "progress", "pulse",
  "scope-expand", "sessions", "recent", "list-parked", "skills",
];

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
    if (FOCUS_COMMANDS.includes(command)) {
      dispatch(command).catch(() => process.exit(1));
      break;
    }
    console.log("Nilai — ADHD-friendly focus sessions for Claude Code\n");
    console.log("Usage:");
    console.log("  nilai init            Initialize Nilai in the current project");
    console.log("  nilai install-hooks   Register Claude Code hooks");
    console.log("  nilai setup           One-command setup (init + hooks)");
    console.log("  nilai update          Update hooks, NILAI.md, and skills");
    console.log("  nilai uninstall       Remove Nilai from the current project");
    console.log("");
    console.log("Focus commands:");
    console.log("  nilai start <task>    Start a focus session");
    console.log("  nilai quick <task>    Quick session (25min default)");
    console.log("  nilai status          Check current session");
    console.log("  nilai end             End session with retro");
    console.log("  nilai resume <id>     Resume archived session");
    console.log("  nilai check <action>  Check if action is in scope");
    console.log("  nilai park <idea>     Park a tangential idea");
    console.log("  nilai log <text>      Log a milestone");
    console.log("  nilai progress        Show criteria checklist");
    console.log("  nilai pulse           Check time usage");
    console.log("  nilai scope-expand    Expand session scope");
    console.log("  nilai sessions        List all sessions");
    console.log("  nilai recent          7-day session summary");
    console.log("  nilai list-parked     Show parked ideas");
    console.log("  nilai skills          List available slash commands");
    process.exit(1);
}
