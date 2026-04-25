import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SKILLS = [
  "focus",
  "focus-start",
  "focus-quick",
  "focus-status",
  "focus-end",
  "focus-resume",
  "focus-check",
  "focus-park",
  "focus-log",
  "focus-progress",
  "focus-pulse",
  "focus-scope-expand",
  "focus-sessions",
  "focus-recent",
  "focus-list-parked",
];

export function installSkills(cwd: string): void {
  const skillsDir = resolve(cwd, ".claude", "skills");
  const sourceDir = resolve(__dirname, "..", "source", "skills");

  if (!existsSync(sourceDir)) {
    console.log("Source skills directory not found — skipping skill installation.");
    console.log(`  Expected: ${sourceDir}`);
    return;
  }

  let installed = 0;
  let updated = 0;

  for (const skillName of SKILLS) {
    const sourcePath = resolve(sourceDir, skillName, "SKILL.md");
    if (!existsSync(sourcePath)) {
      console.log(`  Skill source not found: ${skillName}/SKILL.md — skipping.`);
      continue;
    }

    const destDir = resolve(skillsDir, skillName);
    const destPath = resolve(destDir, "SKILL.md");
    const content = readFileSync(sourcePath, "utf-8");

    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    if (existsSync(destPath)) {
      const existing = readFileSync(destPath, "utf-8");
      if (existing === content) {
        continue;
      }
      updated++;
    } else {
      installed++;
    }

    writeFileSync(destPath, content, "utf-8");
  }

  if (installed > 0) {
    console.log(`Installed ${installed} skill(s) to .claude/skills/`);
  }
  if (updated > 0) {
    console.log(`Updated ${updated} skill(s) to latest version.`);
  }
  if (installed === 0 && updated === 0) {
    console.log("Skills already up to date in .claude/skills/.");
  }
}

export function uninstallSkills(cwd: string): void {
  const skillsDir = resolve(cwd, ".claude", "skills");
  let removed = 0;

  for (const skillName of SKILLS) {
    const destDir = resolve(skillsDir, skillName);
    if (existsSync(destDir)) {
      rmSync(destDir, { recursive: true, force: true });
      removed++;
    }
  }

  if (removed > 0) {
    console.log(`Removed ${removed} skill(s) from .claude/skills/`);
  } else {
    console.log("No Nilai skills found in .claude/skills/ — skipping.");
  }
}
