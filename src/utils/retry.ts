export interface RetryOptions {
  retries?: number;          // maximum attempts (default 3)
  baseDelayMs?: number;      // initial delay (default 500ms)
  factor?: number;           // exponential factor (default 2)
  jitter?: boolean;          // apply jitter (default true)
  onAttempt?: (attempt: number, error?: any) => void; // callback per attempt
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, baseDelayMs = 500, factor = 2, jitter = true, onAttempt } = options;
  let attempt = 0;
  let delay = baseDelayMs;
  while (true) { // eslint-disable-line
    try {
      attempt++;
      return await fn();
    } catch (err) {
      onAttempt?.(attempt, err);
      if (attempt >= retries) throw err;
      const sleep = jitter ? applyJitter(delay) : delay;
      await wait(sleep);
      delay = delay * factor;
    }
  }
}

function wait(ms: number) { return new Promise(res => setTimeout(res, ms)); }
function applyJitter(base: number) { const rand = Math.random() * 0.4 + 0.8; return Math.round(base * rand); }
