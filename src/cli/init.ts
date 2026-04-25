import { mkdirSync, existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { ensureFocusDirs } from "../state/paths.js";
import { NILAI_MD } from "../templates/nilai-md.js";

export function runInit(cwd: string): void {
  // Create .focus/ and .focus/history/
  ensureFocusDirs(cwd);

  // Update .gitignore — add .focus/ if not present
  const gitignorePath = resolve(cwd, ".gitignore");
  const gitignoreEntry = ".focus/";
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, "utf-8");
    if (!content.includes(gitignoreEntry)) {
      appendFileSync(gitignorePath, `\n${gitignoreEntry}\n`, "utf-8");
    }
  } else {
    writeFileSync(gitignorePath, gitignoreEntry + "\n", "utf-8");
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

  console.log("\nNilai initialized. Next steps:");
  console.log("  1. claude mcp add nilai -- npx -y -p @vignu10/nilai nilai-mcp");
  console.log("  2. npx @vignu10/nilai install-hooks");
}
