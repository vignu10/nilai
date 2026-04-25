import { handleUserPromptSubmit } from "./hooks/user-prompt-submit.js";
import { handleSessionStart } from "./hooks/session-start.js";
import { handlePostToolUse } from "./hooks/post-tool-use.js";
import { handleStop } from "./hooks/stop.js";

async function main(): Promise<void> {
  const cwd = process.cwd();

  // Read stdin for hook event data
  let input: Record<string, unknown> = {};
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    const raw = Buffer.concat(chunks).toString("utf-8").trim();
    if (raw) {
      input = JSON.parse(raw);
    }
  } catch {
    // No stdin or parse failure — fall back to legacy UserPromptSubmit
    handleUserPromptSubmit(cwd);
    return;
  }

  const cwdOverride = (input.cwd as string) ?? cwd;
  const eventName = (input.hookEventName as string) ?? "";

  // Detect event from input shape or explicit event name
  if (eventName === "Stop" || eventName === "stop") {
    handleStop(cwdOverride);
  } else if ("tool_name" in input || "tool_input" in input || eventName === "PostToolUse") {
    handlePostToolUse(cwdOverride, input as { tool_name?: string; tool_input?: Record<string, unknown> });
  } else if ("matcher" in input || eventName === "SessionStart") {
    handleSessionStart(cwdOverride);
  } else {
    // Default: UserPromptSubmit (original behavior)
    handleUserPromptSubmit(cwdOverride);
  }
}

main().catch(() => process.exit(0));
