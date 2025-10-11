export function sanitizePlain(text: unknown): string {
  if (text == null) return '';
  return String(text).replace(/[<>&"'`]/g, ch => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  }[ch] as string));
}
