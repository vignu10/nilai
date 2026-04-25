import { readSession, writeSession } from "../state/session.js";
import { appendToLater } from "../state/later.js";

export async function handleFocusPark(
  cwd: string,
  args: { idea: string; why_interesting?: string },
): Promise<{ content: { type: "text"; text: string }[] }> {
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

  await appendToLater(cwd, args.idea, args.why_interesting);

  session.parked_count++;
  await writeSession(cwd, session);

  return {
    content: [
      {
        type: "text",
        text: `Parked: "${args.idea}"\nParked items this session: ${session.parked_count}`,
      },
    ],
  };
}
