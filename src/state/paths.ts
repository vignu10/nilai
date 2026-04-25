import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const FOCUS_DIR = ".focus";
const HISTORY_DIR = ".focus/history";
const SESSION_FILE = ".focus/session.json";
const LATER_FILE = "LATER.md";

export function focusDir(cwd: string): string {
  return resolve(cwd, FOCUS_DIR);
}

export function historyDir(cwd: string): string {
  return resolve(cwd, HISTORY_DIR);
}

export function sessionPath(cwd: string): string {
  return resolve(cwd, SESSION_FILE);
}

export function laterPath(cwd: string): string {
  return resolve(cwd, LATER_FILE);
}

export function ensureFocusDirs(cwd: string): void {
  mkdirSync(resolve(cwd, HISTORY_DIR), { recursive: true });
}
