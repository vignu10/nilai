import { startDay } from "../state/day.js";

export async function handleFocusDayStart(
  cwd: string,
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  try {
    const day = await startDay(cwd, false);
    return {
      content: [
        {
          type: "text",
          text: `Day tracking started for ${day.date}\nAll sessions will be tracked until you run /focus-day-end.`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : "Failed to start day tracking",
        },
      ],
    };
  }
}
