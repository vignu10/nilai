import type { Session } from "../state/session.js";
import { readSession, writeSession, deleteSession } from "../state/session.js";
import { archiveSession } from "../state/history.js";
import { elapsedMinutes } from "../util/time.js";
import { addSessionToDay } from "../state/day.js";
import { addCalibrationRecord } from "../state/calibration.js";

function inferTaskType(task: string): string {
  const keywords: Record<string, string[]> = {
    debug: ["fix", "bug", "error", "debug", "broken", "issue", "fails"],
    code_review: ["review", "refactor", "clean up", "improve", "optimize"],
    feature: ["add", "implement", "create", "build", "new"],
    test: ["test", "spec", "coverage", "mock"],
    docs: ["document", "readme", "comment", "docstring"],
  };

  const taskLower = task.toLowerCase();
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some((w) => taskLower.includes(w))) {
      return type;
    }
  }
  return "general";
}

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
    ...(session.estimated_minutes ? [`Estimation: You said ${session.estimated_minutes}min, took ${elapsed}min (${elapsed > session.estimated_minutes ? "+" : ""}${elapsed - session.estimated_minutes}min)`] : []),
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

  // Save calibration data if estimate was provided
  if (session.estimated_minutes) {
    await addCalibrationRecord(cwd, {
      session_id: session.id,
      task: session.task,
      task_type: inferTaskType(session.task),
      estimated_minutes: session.estimated_minutes,
      actual_minutes: elapsed,
      intensity: session.intensity,
      completed_criteria: session.milestones.length,
      total_criteria: session.done_criteria.length,
      date: new Date().toISOString().slice(0, 10),
    });
  }

  await writeSession(cwd, session);
  await archiveSession(cwd, session);

  // Add to day tracking if active
  await addSessionToDay(cwd, session);

  await deleteSession(cwd);

  // Prompt for energy level if not provided
  let extraMessage = "";
  if (session.energy_start && !session.energy_end) {
    extraMessage = `\n\nRate your ending energy level (1-5): /focus-energy end <level>`;
  }

  return {
    content: [{ type: "text", text: retro + extraMessage }],
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
