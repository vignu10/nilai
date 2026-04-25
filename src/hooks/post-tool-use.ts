import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import type { Session, Snapshot } from "../state/session.js";

const FILE_MUTATING_TOOLS = new Set(["Edit", "MultiEdit", "Write"]);

export function handlePostToolUse(
  cwd: string,
  input: { tool_name?: string; tool_input?: Record<string, unknown> },
): void {
  const toolName = input.tool_name ?? "";
  const toolInput = input.tool_input ?? {};

  // Read session
  const sessionPath = resolve(cwd, ".focus", "session.json");
  let session: Session | null = null;
  try {
    const data = readFileSync(sessionPath, "utf-8");
    session = JSON.parse(data);
  } catch {
    process.exit(0);
  }

  if (!session || session.status !== "active") {
    process.exit(0);
  }

  // Check expiry first — if expired, abandon and skip snapshot
  const idleMinutes = computeIdleMinutes(session);
  if (idleMinutes > 30) {
    abandonSession(cwd, sessionPath, session, "idle");
    process.exit(0);
  }

  // Only snapshot on file-mutating tools
  if (!FILE_MUTATING_TOOLS.has(toolName)) {
    process.exit(0);
  }

  const filePath = toolInput.file_path as string | undefined;
  if (!filePath) {
    process.exit(0);
  }

  const snapshot: Snapshot = {
    last_file: filePath,
    last_line: null,
    last_action: `${toolName === "Write" ? "writing" : "editing"} ${basename(filePath)}`,
    last_tool: toolName,
    at: new Date().toISOString(),
  };

  session.snapshot = snapshot;

  writeFileSync(sessionPath, JSON.stringify(session, null, 2), "utf-8");
  process.exit(0);
}

function computeIdleMinutes(session: Session): number {
  const lastActivity = session.snapshot?.at
    ?? session.milestones.at(-1)?.at
    ?? session.started_at;
  return (Date.now() - new Date(lastActivity).getTime()) / 60_000;
}

function abandonSession(
  cwd: string,
  sessionPath: string,
  session: Session,
  reason: "idle" | "user_ended" | "replaced",
): void {
  session.status = "abandoned";
  session.abandoned_at = new Date().toISOString();
  session.abandonment_reason = reason;

  const historyDir = resolve(cwd, ".focus", "history");
  mkdirSync(historyDir, { recursive: true });

  const archivePath = resolve(historyDir, `${session.id}.json`);
  writeFileSync(archivePath, JSON.stringify(session, null, 2), "utf-8");

  try {
    unlinkSync(sessionPath);
  } catch {
    // already gone
  }
}
