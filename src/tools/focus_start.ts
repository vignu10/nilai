import type { Session } from "../state/session.js";
import { readSession, writeSession } from "../state/session.js";
import { isVagueTask } from "../validation/vague.js";

export async function handleFocusStart(
  cwd: string,
  args: { task: string; done_criteria: string[]; time_box_minutes: number },
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const existing = await readSession(cwd);
  if (existing && existing.status === "active") {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Session already active: "${existing.task}" (started ${existing.started_at}). Call focus_end first.`,
        },
      ],
    };
  }

  const vague = isVagueTask(args.task);
  if (vague.vague) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Task too vague: ${vague.reasons.join(" ")}\n\n${vague.hint}`,
        },
      ],
    };
  }

  // Validate done_criteria specificity
  for (const c of args.done_criteria) {
    if (c.trim().split(/\s+/).length < 3) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Done criterion "${c}" is too vague. Each criterion should be at least 3 words describing an observable outcome.`,
          },
        ],
      };
    }
  }

  const now = new Date();
  const id = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);

  const session: Session = {
    id,
    task: args.task,
    done_criteria: args.done_criteria,
    time_box_minutes: args.time_box_minutes,
    started_at: now.toISOString(),
    milestones: [],
    parked_count: 0,
    status: "active",
  };

  await writeSession(cwd, session);

  return {
    content: [
      {
        type: "text",
        text: `Session started: "${args.task}"\nTime box: ${args.time_box_minutes} minutes\nDone criteria: ${args.done_criteria.length}\n  ${args.done_criteria.map((c) => `- ${c}`).join("\n  ")}`,
      },
    ],
  };
}
