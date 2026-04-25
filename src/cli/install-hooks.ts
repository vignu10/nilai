import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

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
  if (!hooks.UserPromptSubmit) {
    hooks.UserPromptSubmit = [];
  }

  const hookCommand = "npx -y nilai-mcp-hook";

  // Check if our hook is already registered
  const existing = hooks.UserPromptSubmit as Array<Record<string, unknown>>;
  const alreadyInstalled = existing.some((entry) => {
    const hookList = entry.hooks as Array<Record<string, string>> | undefined;
    return hookList?.some((h) => h.command?.includes("nilai-mcp-hook"));
  });

  if (alreadyInstalled) {
    console.log("Hook already installed — skipping.");
    return;
  }

  existing.push({
    matcher: "",
    hooks: [
      {
        type: "command",
        command: hookCommand,
      },
    ],
  });

  if (!existsSync(settingsDir)) {
    mkdirSync(settingsDir, { recursive: true });
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
  console.log("Hook installed in .claude/settings.json");
  console.log("UserPromptSubmit will now include focus session context when a session is active.");
}
