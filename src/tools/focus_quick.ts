import type { Session } from "../state/session.js";
import { readSession, writeSession } from "../state/session.js";

export async function handleFocusQuick(
  cwd: string,
  args: { task: string; time_box_minutes?: number },
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const existing = await readSession(cwd);
  if (existing && existing.status === "active") {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Session already active: "${existing.task}". End it first with focus_end.`,
        },
      ],
    };
  }

  if (args.task.trim().split(/\s+/).length < 3) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Task too short. Give me at least a few words — what are you actually doing?`,
        },
      ],
    };
  }

  const now = new Date();
  const id = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);
  const timeBox = args.time_box_minutes ?? 25;

  // Auto-generate done criteria from the task
  const doneCriteria = [
    `${args.task} — the core change works`,
    "No regressions in existing behavior",
  ];

  const session: Session = {
    id,
    task: args.task,
    done_criteria: doneCriteria,
    time_box_minutes: timeBox,
    intensity: "medium",
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
        text: [
          `Quick session started: "${args.task}"`,
          `Time box: ${timeBox}min`,
          `Auto-generated criteria:`,
          ...doneCriteria.map((c) => `  - ${c}`),
          `Use focus_log at checkpoints. focus_end when done.`,
        ].join("\n"),
      },
    ],
  };
}
