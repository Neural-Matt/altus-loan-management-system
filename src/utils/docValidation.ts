// Document pre-validation & hashing utilities
// These are client-side safeguards; server-side validation should re-check everything.

export const ALLOWED_MIME = ['application/pdf', 'image/png', 'image/jpeg'];
export const MAX_BYTES = 5 * 1024 * 1024; // 5MB limit (adjust as needed)

export interface PreCheckMeta {
  mimeType: string;
  sizeBytes: number;
  checksum: string;
}

export interface PreCheckResult {
  ok: boolean;
  error?: string;
  meta?: PreCheckMeta;
}

export async function computeSha256(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('');
}

export async function preValidateFile(file: File): Promise<PreCheckResult> {
  if (!ALLOWED_MIME.includes(file.type)) {
    return { ok: false, error: 'Unsupported file type' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'File exceeds 5MB size limit' };
  }
  const checksum = await computeSha256(file);
  return {
    ok: true,
    meta: { mimeType: file.type, sizeBytes: file.size, checksum }
  };
}

export interface OcrResult { snippet: string; fullText?: string; detectedNrc?: string | null; }

// Simple NRC pattern (adjust as needed) – alphanumeric or slash characters 6-12 length.
const NRC_REGEX = /[A-Z0-9/]{6,12}/i;

export async function attemptOcr(file: File): Promise<OcrResult | null> {
  if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) return null;
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(file);
    await worker.terminate();
    const fullText: string = data.text || '';
    const snippet = fullText.trim().slice(0, 160);
    const match = fullText.match(NRC_REGEX);
    return { snippet, fullText, detectedNrc: match ? match[0] : null };
  } catch (e) {
    console.warn('OCR failed', e);
    return null;
  }
}
