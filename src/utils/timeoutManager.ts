const MAX_TIMEOUT = 2_147_483_647; // 32-bit signed int max

const scheduledTimeouts = new Map<string, NodeJS.Timeout>();

export function scheduleTimeout(
  id: string,
  timestamp: number,
  callback: () => void
) {
  cancelScheduledTimeout(id);

  const remaining = timestamp - Date.now();

  if (remaining <= 0) {
    callback();
    return;
  }

  const timeout = setSafeTimeout(id, remaining, callback);
  scheduledTimeouts.set(id, timeout);

  console.log(
    `Scheduled timeout for ${id} in ${remaining}ms. Timestamp: ${timestamp}`
  );
}

function setSafeTimeout(
  id: string,
  delay: number,
  callback: () => void
): NodeJS.Timeout {
  if (delay > MAX_TIMEOUT) {
    return setTimeout(() => {
      const nextDelay = delay - MAX_TIMEOUT;
      const nextTimeout = setSafeTimeout(id, nextDelay, callback);
      scheduledTimeouts.set(id, nextTimeout);
    }, MAX_TIMEOUT);
  }

  return setTimeout(() => {
    callback();
    scheduledTimeouts.delete(id);
  }, delay);
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
