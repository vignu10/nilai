import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import type { Session } from "./session.js";
import { historyDir, ensureFocusDirs } from "./paths.js";

export async function archiveSession(cwd: string, session: Session): Promise<void> {
  ensureFocusDirs(cwd);
  const path = resolve(historyDir(cwd), `${session.id}.json`);
  await writeFile(path, JSON.stringify(session, null, 2), "utf-8");
}

export async function readHistory(cwd: string, id: string): Promise<Session | null> {
  const path = resolve(historyDir(cwd), `${id}.json`);
  try {
    const data = await readFile(path, "utf-8");
    return JSON.parse(data) as Session;
  } catch {
    return null;
  }
}

export async function listHistory(cwd: string): Promise<Session[]> {
  const dir = historyDir(cwd);
  try {
    const files = await readdir(dir);
    const sessions: Session[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const data = await readFile(join(dir, file), "utf-8");
        sessions.push(JSON.parse(data));
      } catch {
        // skip corrupted files
      }
    }
    return sessions.sort((a, b) => b.id.localeCompare(a.id));
  } catch {
    return [];
  }
}
