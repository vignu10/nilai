import { readLater } from "../state/later.js";

export async function handleFocusListParked(cwd: string): Promise<{
  content: { type: "text"; text: string }[];
}> {
  const content = await readLater(cwd);
  if (!content) {
    return {
      content: [{ type: "text", text: "No parked ideas yet." }],
    };
  }
  return {
    content: [{ type: "text", text: content }],
  };
}
