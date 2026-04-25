import { readSession } from "../state/session.js";

export async function handleFocusProgress(cwd: string): Promise<{
  content: { type: "text"; text: string }[];
}> {
  const session = await readSession(cwd);
  if (!session || session.status !== "active") {
    return {
      content: [
        { type: "text", text: "No active focus session. Start one with focus_start." },
      ],
    };
  }

  const checkedCriteria = session.done_criteria.map((criterion) => {
    const matched = session.milestones.some((m) =>
      wordsOverlap(m.text, criterion),
    );
    return { criterion, done: matched };
  });

  const criteriaLines = checkedCriteria.map(
    ({ criterion, done }) => `  [${done ? "x" : " "}] ${criterion}`,
  );

  const milestoneLines = session.milestones.map(
    (m, i) => `  ${i + 1}. ${m.at.slice(11, 16)} ${m.text}`,
  );

  return {
    content: [
      {
        type: "text",
        text: [
          "Done criteria:",
          ...criteriaLines,
          "",
          `Milestones (${session.milestones.length}):`,
          ...(milestoneLines.length > 0
            ? milestoneLines
            : ["  (none yet)"]),
        ].join("\n"),
      },
    ],
  };
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
