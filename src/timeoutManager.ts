const scheduledTimeouts = new Map<string, NodeJS.Timeout>();

export function scheduleTimeout(
  id: string,
  timestamp: number,
  callback: () => void
) {
  const delay = timestamp - Date.now();

  if (delay <= 0) {
    callback();
    return;
  }

  cancelScheduledTimeout(id);

  const timeout = setTimeout(() => {
    callback();
    scheduledTimeouts.delete(id);
  }, delay);

  scheduledTimeouts.set(id, timeout);
}

export function cancelScheduledTimeout(id: string): boolean {
  const timeout = scheduledTimeouts.get(id);
  if (timeout) {
    clearTimeout(timeout);
    scheduledTimeouts.delete(id);
    return true;
  }
  return false;
}

export function hasScheduledTimeout(id: string): boolean {
  return scheduledTimeouts.has(id);
}

export function clearAllScheduledTimeouts(): void {
  for (const timeout of scheduledTimeouts.values()) {
    clearTimeout(timeout);
  }
  scheduledTimeouts.clear();
}

export function getScheduledTimeouts(): string[] {
  return [...scheduledTimeouts.keys()];
}
