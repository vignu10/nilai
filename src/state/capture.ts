import { readFile, writeFile, appendFile } from "node:fs/promises";
import { capturePath, captureMarkdownPath, ensureFocusDirs } from "./paths.js";

export type CaptureEntry = {
  id: string;
  text: string;
  timestamp: string;
  session_id?: string; // Associated session if captured during focus
  processed: boolean;
  tags?: string[]; // Auto-generated or manual tags
};

export async function readCaptures(cwd: string): Promise<CaptureEntry[]> {
  const path = capturePath(cwd);
  try {
    const data = await readFile(path, "utf-8");
    return JSON.parse(data) as CaptureEntry[];
  } catch {
    return [];
  }
}

export async function writeCaptures(cwd: string, captures: CaptureEntry[]): Promise<void> {
  ensureFocusDirs(cwd);
  const path = capturePath(cwd);
  await writeFile(path, JSON.stringify(captures, null, 2), "utf-8");
}

export async function addCapture(cwd: string, text: string, sessionId?: string): Promise<void> {
  const captures = await readCaptures(cwd);
  const entry: CaptureEntry = {
    id: Date.now().toString(),
    text,
    timestamp: new Date().toISOString(),
    session_id: sessionId,
    processed: false,
  };
  captures.push(entry);
  await writeCaptures(cwd, captures);
}

export async function appendToCaptureMarkdown(cwd: string, text: string): Promise<void> {
  const path = captureMarkdownPath(cwd);
  const timestamp = new Date().toLocaleString();
  await appendFile(path, `\n- [${timestamp}] ${text}\n`, "utf-8");
}

export async function markCaptureProcessed(cwd: string, id: string): Promise<void> {
  const captures = await readCaptures(cwd);
  const capture = captures.find((c) => c.id === id);
  if (capture) {
    capture.processed = true;
    await writeCaptures(cwd, captures);
  }
}

export async function getUnprocessedCaptures(cwd: string): Promise<CaptureEntry[]> {
  const captures = await readCaptures(cwd);
  return captures.filter((c) => !c.processed);
}
