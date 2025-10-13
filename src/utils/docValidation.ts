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
  // Check if file is valid for OCR processing
  if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) {
    console.warn('File type not supported for OCR:', file.type);
    return null;
  }
  
  // Check file size (avoid processing very large files)
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    console.warn('File too large for OCR processing:', file.size);
    return null;
  }
  
  // Check if file is actually readable
  if (!file.size || file.size === 0) {
    console.warn('File is empty or unreadable');
    return null;
  }
  
  let worker = null;
  try {
    const { createWorker } = await import('tesseract.js');
    
    // Create a worker with better error handling
    worker = await createWorker('eng');
    
    // Validate that the file can be read as an image
    const url = URL.createObjectURL(file);
    const img = new Image();
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = url;
    });
    
    URL.revokeObjectURL(url);
    
    // Perform OCR with timeout
    const { data } = await Promise.race([
      worker.recognize(file),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OCR timeout')), 30000) // 30 second timeout
      )
    ]) as any;
    
    const fullText: string = data.text || '';
    const snippet = fullText.trim().slice(0, 160);
    const match = fullText.match(NRC_REGEX);
    
    return { snippet, fullText, detectedNrc: match ? match[0] : null };
  } catch (e) {
    console.warn('OCR failed:', e instanceof Error ? e.message : 'Unknown error');
    return null;
  } finally {
    // Ensure worker is always terminated
    if (worker) {
      try {
        await worker.terminate();
      } catch (terminateError) {
        console.warn('Failed to terminate OCR worker:', terminateError);
      }
    }
  }
}
