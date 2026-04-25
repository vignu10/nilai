import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { templatesPath, ensureFocusDirs } from "./paths.js";

export type SessionTemplate = {
  id: string;
  name: string;
  description: string;
  category: "debug" | "code_review" | "feature" | "refactor" | "custom";
  default_time_box_minutes: number;
  default_intensity: "low" | "medium" | "high";
  default_done_criteria: string[];
  enable_break_reminders: boolean;
  break_interval_minutes: number;
  enable_stuck_detection: boolean;
  stuck_threshold_minutes: number;
  created_at: string;
  usage_count: number;
};

export async function readTemplates(cwd: string): Promise<SessionTemplate[]> {
  const path = templatesPath(cwd);
  try {
    const data = await readFile(path, "utf-8");
    return JSON.parse(data) as SessionTemplate[];
  } catch {
    return [];
  }
}

export async function writeTemplates(cwd: string, templates: SessionTemplate[]): Promise<void> {
  ensureFocusDirs(cwd);
  const path = templatesPath(cwd);
  await writeFile(path, JSON.stringify(templates, null, 2), "utf-8");
}

export async function getTemplate(cwd: string, id: string): Promise<SessionTemplate | null> {
  const templates = await readTemplates(cwd);
  return templates.find((t) => t.id === id) ?? null;
}

export async function saveTemplate(cwd: string, template: SessionTemplate): Promise<void> {
  const templates = await readTemplates(cwd);
  const existingIndex = templates.findIndex((t) => t.id === template.id);
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }
  await writeTemplates(cwd, templates);
}

export async function incrementTemplateUsage(cwd: string, id: string): Promise<void> {
  const templates = await readTemplates(cwd);
  const template = templates.find((t) => t.id === id);
  if (template) {
    template.usage_count++;
    await writeTemplates(cwd, templates);
  }
}

export async function deleteTemplate(cwd: string, id: string): Promise<void> {
  const templates = await readTemplates(cwd);
  const filtered = templates.filter((t) => t.id !== id);
  await writeTemplates(cwd, filtered);
}
