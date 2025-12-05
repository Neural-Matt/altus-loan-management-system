import React, { createContext, useContext, useState, useCallback } from 'react';
import { Customer, LoanCalculatorResult } from '../../types';

export interface NextOfKinInfo {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  nrc?: string;
  nationality?: string;
  relationship?: string;
}

export interface ReferenceInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  nrc?: string;
  relationship?: string;
}

export interface CustomerInput {
  // Personal Information
  firstName?: string;
  lastName?: string;
  nrc?: string;
  nrcIssueDate?: string;
  dateOfBirth?: string;
  title?: string;
  phone?: string;
  email?: string;
  gender?: string;
  nationality?: string;
  otherNationality?: string;
  maritalStatus?: string;
  
  // Address
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  
  // Employment
  employerName?: string;
  employerId?: string;
  payrollNumber?: string;
  occupation?: string;
  salary?: number;
  employmentDate?: string;
  employmentType?: string;
  
  // Bank Details
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountType?: string;
  
  // Other
  purpose?: string;
  accommodationType?: string; // rented | owned | other
  nextOfKin?: NextOfKinInfo;
  reference?: ReferenceInfo;
  
  // API Integration fields
  customerId?: string; // Altus Customer ID returned from API
  apiCustomerData?: any; // Full API response data for reference
}

export interface LoanParams {
  amount?: number;
  tenureMonths?: number;
  productCode?: string;
  emiResult?: LoanCalculatorResult; // schedule rows now include opening/closing balances & installment
  applicationNumber?: string; // Altus ApplicationNumber returned after successful loan submission
  applicationId?: string; // Alias for applicationNumber for easier access
}

export interface UploadedDoc {
  id?: string; // returned by API when uploaded
  file?: File; // optional so drafts can persist metadata without binary
  type: 'nrc-front' | 'nrc-back' | 'combined-nrc' | 'payslip' | 'payslip-1' | 'payslip-2' | 'payslip-3' | 'reference-letter' | 'work-id' | 'selfie' | 'bank-statement' | 'combined-payslips';
  previewUrl?: string;
  status?: 'pending' | 'uploading' | 'uploaded' | 'verifying' | 'verified' | 'error';
  errorMessage?: string;
  // added verification/meta fields
  sizeBytes?: number;
  mimeType?: string;
  checksumSha256?: string;
  extractedTextSnippet?: string;
  verificationNotes?: string;
  progress?: number; // 0-100 for upload/verification progress
}

interface WizardDataState {
  customer: CustomerInput;
  loan: LoanParams;
  documents: UploadedDoc[];
}

interface WizardDataContextValue extends WizardDataState {
  setCustomer: (data: Partial<CustomerInput>) => void;
  setLoan: (data: Partial<LoanParams>) => void;
  addOrReplaceDocument: (doc: UploadedDoc) => void;
  removeDocument: (type: UploadedDoc['type']) => void;
  resetAll: () => void;
  hydrate: (data: Partial<WizardDataState>) => void;
  replaceAll: (data: WizardDataState) => void;
}

const WizardDataContext = createContext<WizardDataContextValue | undefined>(undefined);

const initialState: WizardDataState = {
  customer: {},
  loan: {},
  documents: []
};

export const WizardDataProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [state, setState] = useState<WizardDataState>(initialState);

  // Migration: if any legacy 'nrc' doc appears, treat it as 'nrc-front'
  // Accept possible legacy type string and map to new union
  const migrateLegacy = useCallback((docs: any[]): UploadedDoc[] => {
    return docs.map(raw => {
      let type = raw.type as string;
      if (type === 'nrc') type = 'nrc-front';
      // Legacy single payslip should map to payslip-1 to integrate with new multi-payslip requirement
      if (type === 'payslip') type = 'payslip-1';
      const allowed = new Set(['nrc-front','nrc-back','payslip','payslip-1','payslip-2','payslip-3','reference-letter','work-id','selfie','bank-statement','combined-payslips']);
      if (!allowed.has(type)) return null; // filter out unknown types
      return { ...raw, type } as UploadedDoc;
    }).filter(Boolean) as UploadedDoc[];
  }, []);

  const setCustomer = useCallback((data: Partial<CustomerInput>) => {
    setState(s => ({ ...s, customer: { ...s.customer, ...data } }));
  }, []);

  const setLoan = useCallback((data: Partial<LoanParams>) => {
    setState(s => ({ ...s, loan: { ...s.loan, ...data } }));
  }, []);

  const addOrReplaceDocument = useCallback((doc: UploadedDoc) => {
    setState(s => {
      const existingIdx = s.documents.findIndex(d => d.type === doc.type);
      const docs = [...s.documents];
      if (existingIdx >= 0) docs[existingIdx] = doc; else docs.push(doc);
      return { ...s, documents: docs };
    });
  }, []);

  const removeDocument = useCallback((type: UploadedDoc['type']) => {
    setState(s => ({ ...s, documents: s.documents.filter(d => d.type !== type) }));
  }, []);

  const resetAll = useCallback(() => setState(initialState), []);

  const hydrate = useCallback((data: Partial<WizardDataState>) => {
    setState(s => ({
      customer: { ...s.customer, ...(data.customer || {}) },
      loan: { ...s.loan, ...(data.loan || {}) },
      documents: data.documents ? migrateLegacy(data.documents) : s.documents
    }));
  }, [migrateLegacy]);

  const replaceAll = useCallback((data: WizardDataState) => {
    setState({
      customer: { ...(data.customer || {}) },
      loan: { ...(data.loan || {}) },
      documents: data.documents ? migrateLegacy(data.documents) : []
    });
  }, [migrateLegacy]);

  return (
    <WizardDataContext.Provider value={{ ...state, setCustomer, setLoan, addOrReplaceDocument, removeDocument, resetAll, hydrate, replaceAll }}>
      {children}
    </WizardDataContext.Provider>
  );
};

export const useWizardData = () => {
  const ctx = useContext(WizardDataContext);
  if (!ctx) throw new Error('useWizardData must be used within WizardDataProvider');
  return ctx;
};
