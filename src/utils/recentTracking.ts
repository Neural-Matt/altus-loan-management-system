export interface TrackedRefEntry {
  ref: string;
  status: string;
  lastUpdated: string; // server lastUpdated
  firstSeen: string;   // when user first tracked it
  loanId?: string;
  requestId?: string;
}

const KEY = 'altus_recent_tracking_v1';
const MAX = 25;

function loadAll(): TrackedRefEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch { return []; }
}

function saveAll(list: TrackedRefEntry[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch {}
}

export function upsertTracked(entry: TrackedRefEntry) {
  const list = loadAll();
  const idx = list.findIndex(e => e.ref === entry.ref);
  if (idx >= 0) list[idx] = { ...list[idx], ...entry };
  else list.unshift(entry);
  saveAll(list);
}

export function removeTracked(ref: string) {
  const list = loadAll().filter(e => e.ref !== ref);
  saveAll(list);
}

export function clearTracked() { saveAll([]); }

export function getTracked(): TrackedRefEntry[] { return loadAll(); }
