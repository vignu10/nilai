import type { Session } from "../state/session.js";
import { readSession, writeSession } from "../state/session.js";

export async function handleFocusStuck(
  cwd: string,
  args: { response: "investigate" | "park" | "split" },
): Promise<{ content: { type: "text"; text: string }[] }> {
  const session = await readSession(cwd);
  if (!session) {
    return { content: [{ type: "text", text: "No active session." }] };
  }

  // Record response
  if (!session.stuck_responses) session.stuck_responses = [];
  session.stuck_responses.push({
    timestamp: new Date().toISOString(),
    response: args.response,
  });

  await writeSession(cwd, session);

  let action = "";
  switch (args.response) {
    case "investigate":
      action = "Let's investigate what's blocking progress. What specific obstacle are you facing? Try /investigate to debug systematically.";
      break;
    case "park":
      action = "Parking current task. Use /focus-park to capture what you want to come back to, then start a new session.";
      break;
    case "split":
      action = "Let's break this into smaller tasks. What's the first sub-task you can complete in 5-10 minutes?";
      break;
  }

  return { content: [{ type: "text", text: action }] };
}
