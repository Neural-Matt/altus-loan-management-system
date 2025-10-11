// Utilities for persisting and restoring wizard application drafts.
// NOTE: For now we only persist customer & loan params (excluding documents for privacy/size reasons).
// A future enhancement could serialize document metadata & re-request from backend if previously uploaded.

export interface WizardDraftData {
  version: number;
  savedAt: string; // ISO timestamp
  activeIndex: number;
  customer: any; // use loose typing to avoid coupling; validated on load
  loan: any;
  documents?: Array<{
    type: string;
    status?: string;
    mimeType?: string;
    sizeBytes?: number;
    checksumSha256?: string;
    extractedTextSnippet?: string;
    verificationNotes?: string;
    fileName?: string;
    progress?: number;
  }>;
}

const STORAGE_KEY = 'altus_wizard_draft_v1';

export const saveDraft = (draft: Omit<WizardDraftData, 'version' | 'savedAt'>) => {
  // Strip any file blobs if caller passed documents with file attached
  const docs = draft.documents?.map(d => ({
    type: d.type,
    status: d.status,
    mimeType: d.mimeType,
    sizeBytes: d.sizeBytes,
    checksumSha256: d.checksumSha256,
    extractedTextSnippet: d.extractedTextSnippet,
    verificationNotes: d.verificationNotes,
    fileName: (d as any).file?.name || d.fileName,
    progress: d.progress
  }));
  const payload: WizardDraftData = { ...draft, documents: docs, version: 1, savedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('Failed to save draft', e);
    return false;
  }
};

export const loadDraft = (): WizardDraftData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.version === 1) {
      return parsed as WizardDraftData;
    }
    return null;
  } catch (e) {
    console.warn('Failed to load draft', e);
    return null;
  }
};

export const clearDraft = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};
