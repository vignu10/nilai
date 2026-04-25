export function formatElapsed(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  return formatDuration(ms);
}

export function formatRemaining(
  startedAt: string,
  timeBoxMinutes: number,
): number {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  const budget = timeBoxMinutes * 60_000;
  return Math.max(0, Math.round((budget - elapsed) / 60_000));
}

export function elapsedMinutes(startedAt: string): number {
  const ms = Date.now() - new Date(startedAt).getTime();
  return Math.round(ms / 60_000);
}

export function getNudge(
  startedAt: string,
  timeBoxMinutes: number,
  milestoneCount: number,
): string {
  const elapsed = elapsedMinutes(startedAt);
  const remaining = formatRemaining(startedAt, timeBoxMinutes);

  if (elapsed > timeBoxMinutes) {
    const over = elapsed - timeBoxMinutes;
    return `Session is ${over} minute${over !== 1 ? "s" : ""} over the ${timeBoxMinutes}min time box. Consider calling focus_end.`;
  }

  if (remaining <= timeBoxMinutes * 0.1) {
    return `Approaching time box limit. ${remaining} minute${remaining !== 1 ? "s" : ""} remaining.`;
  }

  if (milestoneCount === 0 && elapsed > timeBoxMinutes * 0.3) {
    return `${elapsed} of ${timeBoxMinutes} minutes used with no milestones logged. Are you on track?`;
  }

  return `${elapsed} of ${timeBoxMinutes} minutes used. ${milestoneCount} milestone${milestoneCount !== 1 ? "s" : ""} logged.`;
}

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 60) return `${totalMin}m`;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
