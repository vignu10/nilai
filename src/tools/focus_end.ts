import { readSession, writeSession, deleteSession } from "../state/session.js";
import { archiveSession } from "../state/history.js";
import { elapsedMinutes } from "../util/time.js";

export async function handleFocusEnd(cwd: string): Promise<{
  content: { type: "text"; text: string }[];
}> {
  const session = await readSession(cwd);
  if (!session || session.status !== "active") {
    return {
      content: [
        { type: "text", text: "No active focus session to end." },
      ],
    };
  }

  session.status = "ended";
  session.ended_at = new Date().toISOString();

  const elapsed = elapsedMinutes(session.started_at);
  const budget = session.time_box_minutes;

  const checkedCriteria = session.done_criteria.map((criterion) => {
    const matched = session.milestones.some((m) =>
      wordsOverlap(m.text, criterion),
    );
    return { criterion, done: matched };
  });

  const criteriaLines = checkedCriteria.map(
    ({ criterion, done }) => `  [${done ? "x" : " "}] ${criterion}`,
  );

  const unfinished = checkedCriteria
    .filter((c) => !c.done)
    .map((c) => `  - ${c.criterion}`);

  const retro = [
    `Session retro: ${session.task}`,
    `Duration: ${elapsed}min (budgeted ${budget}min)`,
    `Milestones: ${session.milestones.length}`,
    `Parked items: ${session.parked_count}`,
    "",
    "Criteria status:",
    ...criteriaLines,
    ...(unfinished.length > 0
      ? ["", "Unfinished criteria:", ...unfinished]
      : []),
    "",
    session.milestones.length > 0
      ? "Milestones:\n" +
        session.milestones
          .map((m, i) => `  ${i + 1}. ${m.text}`)
          .join("\n")
      : "(no milestones logged)",
  ].join("\n");

  await writeSession(cwd, session);
  await archiveSession(cwd, session);
  await deleteSession(cwd);

  return {
    content: [{ type: "text", text: retro }],
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
