import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const FOCUS_DIR = ".focus";
const HISTORY_DIR = ".focus/history";
const SESSION_FILE = ".focus/session.json";
const DAY_FILE = ".focus/day.json";
const LATER_FILE = "LATER.md";
const TEMPLATES_FILE = ".focus/templates.json";
const ENERGY_HISTORY_FILE = ".focus/energy.json";
const CALIBRATION_HISTORY_FILE = ".focus/calibration.json";
const CAPTURE_FILE = ".focus/capture.json";
const CAPTURE_MD = "CAPTURE.md";

export function focusDir(cwd: string): string {
  return resolve(cwd, FOCUS_DIR);
}

export function historyDir(cwd: string): string {
  return resolve(cwd, HISTORY_DIR);
}

export function sessionPath(cwd: string): string {
  return resolve(cwd, SESSION_FILE);
}

export function dayPath(cwd: string): string {
  return resolve(cwd, DAY_FILE);
}

export function laterPath(cwd: string): string {
  return resolve(cwd, LATER_FILE);
}

export function templatesPath(cwd: string): string {
  return resolve(cwd, TEMPLATES_FILE);
}

export function energyPath(cwd: string): string {
  return resolve(cwd, ENERGY_HISTORY_FILE);
}

export function calibrationPath(cwd: string): string {
  return resolve(cwd, CALIBRATION_HISTORY_FILE);
}

export function capturePath(cwd: string): string {
  return resolve(cwd, CAPTURE_FILE);
}

export function captureMarkdownPath(cwd: string): string {
  return resolve(cwd, CAPTURE_MD);
}

export function ensureFocusDirs(cwd: string): void {
  mkdirSync(resolve(cwd, HISTORY_DIR), { recursive: true });
}
