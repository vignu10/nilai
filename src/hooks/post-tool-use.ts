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

  // Check expiry first
  const idleMinutes = computeIdleMinutes(session);
  if (idleMinutes > 30) {
    abandonSession(cwd, sessionPath, session, "idle");
    process.exit(0);
  }

  const messages: string[] = [];
  let snapshotUpdated = false;

  // Snapshot on file-mutating tools
  if (FILE_MUTATING_TOOLS.has(toolName)) {
    const filePath = toolInput.file_path as string | undefined;
    if (filePath) {
      const snapshot: Snapshot = {
        last_file: filePath,
        last_line: null,
        last_action: `${toolName === "Write" ? "writing" : "editing"} ${basename(filePath)}`,
        last_tool: toolName,
        at: new Date().toISOString(),
      };
      session.snapshot = snapshot;
      snapshotUpdated = true;

      // Scope drift flag
      if (!fileRelatesToTask(filePath, session.task, session.done_criteria)) {
        messages.push(
          `Scope note: editing ${basename(filePath)} may be outside the session scope ("${session.task}").`,
        );
      }
    }
  }

  // Time nudge: >50% time elapsed, <50% criteria done
  const elapsed = (Date.now() - new Date(session.started_at).getTime()) / 60_000;
  const timeFraction = elapsed / session.time_box_minutes;
  const criteriaDone = countCriteriaDone(session);
  const criteriaFraction = criteriaDone / session.done_criteria.length;

  if (timeFraction > 0.5 && criteriaFraction < 0.5) {
    messages.push(
      `Time check: ${Math.round(elapsed)}min of ${session.time_box_minutes}min elapsed. ${criteriaDone} of ${session.done_criteria.length} criteria done.`,
    );
  }

  if (snapshotUpdated) {
    writeFileSync(sessionPath, JSON.stringify(session, null, 2), "utf-8");
  }

  if (messages.length > 0) {
    const output = {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: messages.join(" "),
      },
    };
    process.stdout.write(JSON.stringify(output));
  }
}

function countCriteriaDone(session: Session): number {
  let count = 0;
  for (const criterion of session.done_criteria) {
    if (session.milestones.some((m) => wordsOverlap(m.text, criterion))) {
      count++;
    }
  }
  return count;
}

function wordsOverlap(a: string, b: string): boolean {
  const stopWords = new Set([
    "a", "an", "the", "to", "of", "in", "for", "on", "with", "at",
    "by", "from", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "and", "or", "but", "if",
    "that", "this", "it", "not", "no", "so", "as",
  ]);
  const wordsB = new Set(
    b.toLowerCase().split(/\s+/).filter((w) => !stopWords.has(w) && w.length > 2),
  );
  const wordsA = a.toLowerCase().split(/\s+/);
  let matches = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) matches++;
  }
  return matches >= 2;
}

function fileRelatesToTask(filePath: string, task: string, criteria: string[]): boolean {
  const parts = filePath.toLowerCase().split(/[/\\]/);
  const fileName = parts[parts.length - 1] ?? "";
  const dirNames = parts.slice(0, -1);

  const keywords = extractKeywords([task, ...criteria]);
  const fileParts = [...dirNames, fileName.replace(/\.[^.]+$/, "")];

  for (const kw of keywords) {
    for (const part of fileParts) {
      if (part.includes(kw) || kw.includes(part)) return true;
    }
  }
  return false;
}

function extractKeywords(texts: string[]): string[] {
  const stopWords = new Set([
    "a", "an", "the", "to", "of", "in", "for", "on", "with", "at",
    "by", "from", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "and", "or", "but", "if",
    "that", "this", "it", "not", "no", "so", "as", "add", "fix",
    "implement", "remove", "change", "update", "make", "ensure",
    "create", "set", "write", "check",
  ]);
  const words = new Set<string>();
  for (const text of texts) {
    for (const w of text.toLowerCase().split(/\s+/)) {
      if (w.length > 2 && !stopWords.has(w)) words.add(w);
    }
  }
  return [...words];
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
