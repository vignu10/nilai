import { readSession, writeSession } from "../state/session.js";

export async function handleFocusLog(
  cwd: string,
  args: { milestone: string },
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const session = await readSession(cwd);
  if (!session || session.status !== "active") {
    return {
      content: [
        {
          type: "text",
          text: "No active focus session. Start one with focus_start.",
        },
      ],
    };
  }

  if (args.milestone.trim().split(/\s+/).length < 3) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Milestone too vague: "${args.milestone}". Use a past-tense description of an observable state change. Example: "Added retry logic to login endpoint."`,
        },
      ],
    };
  }

  session.milestones.push({
    at: new Date().toISOString(),
    text: args.milestone,
  });

  await writeSession(cwd, session);

  return {
    content: [
      {
        type: "text",
        text: `Milestone logged: "${args.milestone}"\nTotal milestones: ${session.milestones.length}`,
      },
    ],
  };
}
