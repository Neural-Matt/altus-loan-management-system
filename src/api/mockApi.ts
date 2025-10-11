interface MockSubmission {
  id: string;
  created: string;
  statusTimeline: { stage: string; ts: string; description?: string }[];
  currentStatus: string;
  location?: string;
  source?: string;
  customerName?: string;
  nrcNumber?: string;
  loanAmount?: number;
  loanProduct?: string;
}

export interface MockSubmitResult { referenceId: string; status: string; location?: string; message?: string; }
export interface MockStatusResult extends MockSubmission {}

const store: Record<string, MockSubmission> = {};

// Add some sample test data for testing
function initializeSampleData() {
  if (Object.keys(store).length === 0) {
    const sampleRef = 'ALT24127890AB';
    store[sampleRef] = {
      id: sampleRef,
      created: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
      statusTimeline: [
        { 
          stage: 'submitted', 
          ts: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
          description: 'Application submitted successfully'
        },
        { 
          stage: 'review', 
          ts: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          description: 'Documents under review'
        },
        { 
          stage: 'pending', 
          ts: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          description: 'Additional verification required'
        },
      ],
      currentStatus: 'pending',
      location: 'Lusaka, Zambia',
      source: 'web',
      customerName: 'John Mwanza',
      nrcNumber: '123456/78/90',
      loanAmount: 15000,
      loanProduct: 'government-personal',
    };
  }
}

// Helper to generate reference number using part of NRC
function generateReferenceNumber(nrcNumber?: string): string {
  if (!nrcNumber) {
    // Fallback if no NRC provided
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ALT${new Date().getFullYear().toString().slice(-2)}${randomPart}`;
  }
  
  // Clean NRC and extract meaningful parts
  const cleanNRC = nrcNumber.replace(/[^0-9]/g, '');
  const nrcPart = cleanNRC.slice(-4); // Use last 4 digits of NRC
  const randomPart = Math.random().toString(36).substring(2, 4).toUpperCase();
  const datePart = new Date().getFullYear().toString().slice(-2);
  const monthPart = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  return `ALT${datePart}${monthPart}${nrcPart}${randomPart}`;
}

// Helper to derive a location string
function deriveLocation(payload: any): string {
  const raw =
    payload?.customer?.address ||
    payload?.customer?.city ||
    payload?.customer?.nationality ||
    payload?.customer?.country ||
    '';
  if (typeof raw !== 'string') return 'Lusaka, Zambia';
  const trimmed = raw.trim();
  const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
  const guess = parts.length ? parts[parts.length - 1] : trimmed;
  return guess || 'Lusaka, Zambia';
}

export const isMockMode = () => process.env.REACT_APP_MOCK_MODE === 'true';

export function mockSubmitApplication(payload: any): Promise<MockSubmitResult> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const nrcNumber = payload?.customer?.nrc || '';
  const referenceId = generateReferenceNumber(nrcNumber);
  const now = new Date().toISOString();
  const location = deriveLocation(payload);
  
  store[referenceId] = {
    id: referenceId,
    created: now,
    statusTimeline: [
      { 
        stage: 'submitted', 
        ts: now,
        description: 'Application submitted successfully'
      },
      { 
        stage: 'review', 
        ts: now,
        description: 'Documents under review'
      },
    ],
    currentStatus: 'review',
    location,
    source: 'web',
    customerName: `${payload?.customer?.firstName || ''} ${payload?.customer?.lastName || ''}`.trim(),
    nrcNumber: nrcNumber,
    loanAmount: payload?.loan?.amount || 0,
    loanProduct: payload?.loan?.productCode || 'Unknown',
  };
  
  return Promise.resolve({ 
    referenceId, 
    status: 'review', 
    location,
    message: 'Application submitted successfully. You will be contacted within 24-48 hours.'
  });
}

export function mockGetStatus(ref: string): Promise<MockStatusResult> {
  // Initialize sample data on first call
  initializeSampleData();
  
  const found = store[ref];
  if (!found) {
    return Promise.reject(new Error('Application not found. Please check your reference number.'));
  }
  
  // Simulate progression over time
  const elapsed = Date.now() - Date.parse(found.created);
  const hours = elapsed / (1000 * 60 * 60);
  
  // Progress application status based on time elapsed
  if (hours > 24 && found.currentStatus === 'review') {
    found.currentStatus = 'pending';
    found.statusTimeline.push({ 
      stage: 'pending', 
      ts: new Date().toISOString(),
      description: 'Additional verification required'
    });
  } else if (hours > 48 && found.currentStatus === 'pending') {
    // Randomly approve or reject
    const approved = Math.random() > 0.2; // 80% approval rate
    if (approved) {
      found.currentStatus = 'approved';
      found.statusTimeline.push({ 
        stage: 'approved', 
        ts: new Date().toISOString(),
        description: 'Loan approved. Disbursement in progress.'
      });
    } else {
      found.currentStatus = 'rejected';
      found.statusTimeline.push({ 
        stage: 'rejected', 
        ts: new Date().toISOString(),
        description: 'Application declined. Please contact support for details.'
      });
    }
  } else if (hours > 72 && found.currentStatus === 'approved') {
    found.currentStatus = 'disbursed';
    found.statusTimeline.push({ 
      stage: 'disbursed', 
      ts: new Date().toISOString(),
      description: 'Loan amount disbursed to your account'
    });
  }
  
  return Promise.resolve(found);
}
