import { mkdirSync, existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { ensureFocusDirs } from "../state/paths.js";
import { NILAI_MD } from "../templates/nilai-md.js";
import { installSkills } from "./install-skills.js";
import { initializeDefaultTemplates } from "../state/default-templates.js";

export function runInit(cwd: string): void {
  // Create .focus/ and .focus/history/
  ensureFocusDirs(cwd);

  // Update .gitignore
  const gitignorePath = resolve(cwd, ".gitignore");
  const gitignoreEntries = [".focus/", ".claude/skills/focus*/", "LATER.md", "CAPTURE.md"];
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, "utf-8");
    const additions = gitignoreEntries.filter((e) => !content.includes(e));
    if (additions.length > 0) {
      appendFileSync(gitignorePath, `\n${additions.join("\n")}\n`, "utf-8");
    }
  } else {
    writeFileSync(gitignorePath, gitignoreEntries.join("\n") + "\n", "utf-8");
  }

  // Write NILAI.md
  const nilaiPath = resolve(cwd, "NILAI.md");
  if (!existsSync(nilaiPath)) {
    writeFileSync(nilaiPath, NILAI_MD, "utf-8");
    console.log("Created NILAI.md");
  } else {
    console.log("NILAI.md already exists — skipping.");
  }

  // Handle CLAUDE.md — append @NILAI.md reference
  const claudePath = resolve(cwd, "CLAUDE.md");
  const reference = "@NILAI.md";
  if (existsSync(claudePath)) {
    const content = readFileSync(claudePath, "utf-8");
    if (!content.includes(reference)) {
      appendFileSync(claudePath, `\n${reference}\n`, "utf-8");
      console.log("Appended @NILAI.md to CLAUDE.md");
    } else {
      console.log("CLAUDE.md already references NILAI.md — skipping.");
    }
  } else {
    writeFileSync(claudePath, reference + "\n", "utf-8");
    console.log("Created CLAUDE.md with @NILAI.md reference");
  }

  // Initialize default templates
  initializeDefaultTemplates(cwd);
  console.log("Initialized default templates");

  // Install skills to .claude/skills/
  console.log("");
  installSkills(cwd);

  console.log("\nNilai initialized. Next step:");
  console.log("  npx @vignu10/nilai install-hooks");
}
