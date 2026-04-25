import { writeSync } from "node:fs";

export type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

export async function runTool(result: Promise<ToolResult>): Promise<void> {
  const r = await result;
  const text = r.content.map((c) => c.text).join("\n") + "\n";
  writeSync(1, text);
  if (r.isError) {
    process.exit(1);
  }
}
