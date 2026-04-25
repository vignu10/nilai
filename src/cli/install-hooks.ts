import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const HOOK_COMMAND = "npx -y -p @vignu10/nilai nilai-mcp-hook";

const EVENTS = ["UserPromptSubmit", "SessionStart", "PostToolUse", "Stop"] as const;

export function runInstallHooks(cwd: string): void {
  const settingsDir = resolve(cwd, ".claude");
  const settingsPath = resolve(settingsDir, "settings.json");

  let settings: Record<string, unknown> = {};
  if (existsSync(settingsPath)) {
    settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
  }

  if (!settings.hooks) {
    settings.hooks = {};
  }

  const hooks = settings.hooks as Record<string, unknown>;

  for (const event of EVENTS) {
    if (!hooks[event]) {
      hooks[event] = [];
    }

    const entries = hooks[event] as Array<Record<string, unknown>>;
    const alreadyInstalled = entries.some((entry) => {
      const hookList = entry.hooks as Array<Record<string, string>> | undefined;
      return hookList?.some((h) => h.command?.includes("nilai-mcp-hook"));
    });

    if (alreadyInstalled) {
      console.log(`${event} hook already installed — skipping.`);
      continue;
    }

    entries.push({
      matcher: "",
      hooks: [
        {
          type: "command",
          command: HOOK_COMMAND,
        },
      ],
    });

    console.log(`${event} hook installed.`);
  }

  if (!existsSync(settingsDir)) {
    mkdirSync(settingsDir, { recursive: true });
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
  console.log("\nHooks registered in .claude/settings.json");
}
