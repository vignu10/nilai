import { readFile, writeFile } from "node:fs/promises";
import { laterPath } from "../state/paths.js";

interface ParkedItem {
  timestamp: string;
  idea: string;
  why?: string;
  index: number;
}

export async function handleFocusUnpark(
  cwd: string,
  args: { index?: number },
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const path = laterPath(cwd);
  let content: string;

  try {
    content = await readFile(path, "utf-8");
  } catch {
    return {
      content: [{ type: "text", text: "No parked ideas found. LATER.md doesn't exist yet." }],
    };
  }

  const items = parseLaterItems(content);

  if (items.length === 0) {
    return {
      content: [{ type: "text", text: "No parked ideas in LATER.md." }],
    };
  }

  // If no index provided, list items
  if (args.index === undefined) {
    const lines = [
      `Parked ideas (${items.length} total):`,
      "",
      ...items.map(
        (item, i) =>
          `${i + 1}. **${item.idea}**${item.why ? `\n   _Why: ${item.why}_` : ""}\n   _${item.timestamp}_`,
      ),
      "",
      "To work on a parked item:",
      "  /focus-unpark <number>  Start a focus session with that item",
    ];

    return {
      content: [{ type: "text", text: lines.join("\n") }],
    };
  }

  // Validate index
  if (args.index < 1 || args.index > items.length) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Invalid index ${args.index}. Valid range: 1-${items.length}`,
        },
      ],
    };
  }

  const item = items[args.index - 1];

  // Remove the item from LATER.md
  const updatedContent = removeLaterItem(content, item.index);
  await writeFile(path, updatedContent, "utf-8");

  const lines = [
    `Unparked: "${item.idea}"`,
    ...(item.why ? [`_Why: ${item.why}_`, ""] : []),
    "Ready to start a focus session with this task.",
    "",
    "Suggested next steps:",
    `  /focus-start "${item.idea}" --criteria "Decide on criteria" --time 25`,
  ];

  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}

function parseLaterItems(content: string): ParkedItem[] {
  const items: ParkedItem[] = [];
  const entries = content.split(/\n---\n/);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const timestampMatch = entry.match(/## (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
    const ideaMatch = entry.match(/\*\*Idea:\*\* (.+)/);
    const whyMatch = entry.match(/\*\*Why:\*\* (.+)/);

    if (timestampMatch && ideaMatch) {
      items.push({
        timestamp: timestampMatch[1],
        idea: ideaMatch[1],
        why: whyMatch?.[1],
        index: i,
      });
    }
  }

  return items.reverse(); // Newest first
}

function removeLaterItem(content: string, index: number): string {
  const entries = content.split(/\n---\n/);
  entries.splice(index, 1);
  return entries.join("\n---\n");
}
