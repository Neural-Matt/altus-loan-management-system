// Minimal module declaration to satisfy TS for dynamic import of tesseract.js
// Extend if deeper typing needed.
declare module 'tesseract.js' {
  export function createWorker(lang?: string): Promise<{ recognize: (f: File | Blob | string) => Promise<{ data: { text: string } }>; terminate: () => Promise<void>; }>;
}
