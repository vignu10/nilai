import { readSession } from "../state/session.js";
import { addCapture, appendToCaptureMarkdown } from "../state/capture.js";

export async function handleFocusCapture(
  cwd: string,
  args: { thought: string },
): Promise<{ content: { type: "text"; text: string }[] }> {
  if (!args.thought || args.thought.trim().length === 0) {
    return { content: [{ type: "text", text: "Usage: /focus-capture <thought>" }] };
  }

  const session = await readSession(cwd);

  // Add to capture system
  await addCapture(cwd, args.thought, session?.id);

  // Append to CAPTURE.md
  await appendToCaptureMarkdown(cwd, args.thought);

  return {
    content: [{
      type: "text",
      text: `Captured: "${args.thought}"\nAdded to CAPTURE.md. Process it later.`,
    }],
  };
}
