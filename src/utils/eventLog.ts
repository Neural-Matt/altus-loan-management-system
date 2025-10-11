type EventName =
  | 'wizard_step_change'
  | 'draft_saved'
  | 'draft_resumed'
  | 'doc_upload_start'
  | 'doc_verified'
  | 'submission_success'
  | 'submission_failed'
  | 'tracking_status_fetch';

interface LogEvent { name: EventName; ts: string; data?: Record<string, any>; }

const buffer: LogEvent[] = [];

export function logEvent(name: EventName, data?: Record<string, any>) {
  const evt: LogEvent = { name, data, ts: new Date().toISOString() };
  buffer.push(evt);
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.info('[event]', evt);
  }
}

export function getEventLog() { return [...buffer]; }
