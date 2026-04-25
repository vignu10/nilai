const VAGUE_VERBS = [
  "improve",
  "enhance",
  "refactor",
  "look into",
  "explore",
  "investigate",
  "polish",
  "clean up",
  "review",
  "consider",
  "think about",
  "understand",
  "figure out",
  "work on",
  "deal with",
  "handle",
];

const VAGUE_NOUNS = [
  "stuff",
  "things",
  "the codebase",
  "the app",
  "the project",
  "everything",
];

export type VagueResult = {
  vague: boolean;
  reasons: string[];
  hint: string;
};

export function isVagueTask(task: string): VagueResult {
  const lower = task.toLowerCase().trim();
  const reasons: string[] = [];

  // Too short
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length < 4) {
    reasons.push("Task is fewer than 4 words.");
  }

  // Vague verb at start
  for (const verb of VAGUE_VERBS) {
    if (lower.startsWith(verb + " ") || lower === verb) {
      reasons.push(`Starts with vague verb "${verb}".`);
      break;
    }
  }

  // Vague nouns anywhere
  for (const noun of VAGUE_NOUNS) {
    if (lower.includes(noun)) {
      reasons.push(`Contains vague noun "${noun}".`);
      break;
    }
  }

  if (reasons.length === 0) {
    return { vague: false, reasons: [], hint: "" };
  }

  const hint =
    "Try: start with a concrete verb (add, fix, implement, remove, change), specify what changes and where. Example: 'Add retry logic to the login API endpoint'.";

  return { vague: true, reasons, hint };
}
