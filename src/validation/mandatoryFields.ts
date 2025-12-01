/**
 * Mandatory Field Validation for UAT API V2
 * Based on comprehensive UAT documentation analysis
 */

import {
  isValidAge,
  isValidEmail,
  isNotFutureDate,
  isValidCustomerStatus,
  isValidGender,
  isValidTitle,
  isValidSector,
  isValidEmploymentType,
  isValidCustomerType,
  isValidCommand,
  isValidAccountType,
  isValidBusinessPremisesType,
  isValidEntityType
} from '../constants/validationConstants';

// ============================================================================
// RETAIL CUSTOMER - MANDATORY FIELDS
// ============================================================================

export interface RetailCustomerValidation {
  Command: string; // "Create" or "Update"
  FirstName: string; // Mand
  LastName: string; // Mand
  CustomerStatus: string; // Mand - Pre-defined: Active, Dormant, BlackListed, Deceased, InActive
  NRCIssueDate: string; // Mand - Date, cannot be future
  UpdatedBy: string; // Mand
  PrimaryAddress: string; // Mand
  ProvinceName: string; // Mand
  DistrictName: string; // Mand
  CountryName: string; // Mand
  Postalcode: string; // Mand
  NRCNumber: string; // Mand - Unique
  ContactNo: string; // Mand
  EmailID: string; // Mand - Valid email format
  BranchName: string; // Mand
  GenderName: string; // Mand - Pre-defined: Male, Female
  Title: string; // Mand - Pre-defined: Mr, Mrs, Miss, Ms, Dr
  DOB: string; // Mand - Date, minimum 18 years old, cannot be future
  FinancialInstitutionName: string; // Mand
  FinancialInstitutionBranchName: string; // Mand
  AccountNumber: string; // Mand
  AccountType: string; // Mand - Pre-defined: Savings, Current
  // Optional for Update
  CustomerID?: string; // Mand for Update command
}

export const validateRetailCustomer = (data: Partial<RetailCustomerValidation>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Command validation
  if (!data.Command || !isValidCommand(data.Command)) {
    errors.push('Command is mandatory and must be "Create" or "Update"');
  }

  // CustomerID validation for Update
  if (data.Command === 'Update' && !data.CustomerID) {
    errors.push('CustomerID is mandatory for Update command');
  }

  // Personal Information
  if (!data.FirstName || data.FirstName.trim() === '') {
    errors.push('FirstName is mandatory');
  }
  
  if (!data.LastName || data.LastName.trim() === '') {
    errors.push('LastName is mandatory');
  }

  if (!data.CustomerStatus || !isValidCustomerStatus(data.CustomerStatus)) {
    errors.push('CustomerStatus is mandatory and must be one of: Active, Dormant, BlackListed, Deceased, InActive');
  }

  if (!data.GenderName || !isValidGender(data.GenderName)) {
    errors.push('GenderName is mandatory and must be "Male" or "Female"');
  }

  if (!data.Title || !isValidTitle(data.Title)) {
    errors.push('Title is mandatory and must be one of: Mr, Mrs, Miss, Ms, Dr');
  }

  // Date validations
  if (!data.DOB) {
    errors.push('DOB (Date of Birth) is mandatory');
  } else {
    if (!isValidAge(data.DOB)) {
      errors.push('Customer must be at least 18 years old');
    }
    if (!isNotFutureDate(data.DOB)) {
      errors.push('DOB cannot be a future date');
    }
  }

  if (!data.NRCIssueDate) {
    errors.push('NRCIssueDate is mandatory');
  } else if (!isNotFutureDate(data.NRCIssueDate)) {
    errors.push('NRCIssueDate cannot be a future date');
  }

  // Identity
  if (!data.NRCNumber || data.NRCNumber.trim() === '') {
    errors.push('NRCNumber is mandatory and must be unique');
  }

  // Contact Information
  if (!data.ContactNo || data.ContactNo.trim() === '') {
    errors.push('ContactNo is mandatory');
  }

  if (!data.EmailID) {
    errors.push('EmailID is mandatory');
  } else if (!isValidEmail(data.EmailID)) {
    errors.push('EmailID must be a valid email address');
  }

  // Address
  if (!data.PrimaryAddress || data.PrimaryAddress.trim() === '') {
    errors.push('PrimaryAddress is mandatory');
  }

  if (!data.ProvinceName || data.ProvinceName.trim() === '') {
    errors.push('ProvinceName is mandatory');
  }

  if (!data.DistrictName || data.DistrictName.trim() === '') {
    errors.push('DistrictName is mandatory');
  }

  if (!data.CountryName || data.CountryName.trim() === '') {
    errors.push('CountryName is mandatory');
  }

  if (!data.Postalcode || data.Postalcode.trim() === '') {
    errors.push('Postalcode is mandatory');
  }

  // Branch
  if (!data.BranchName || data.BranchName.trim() === '') {
    errors.push('BranchName is mandatory');
  }

  // Bank Details
  if (!data.FinancialInstitutionName || data.FinancialInstitutionName.trim() === '') {
    errors.push('FinancialInstitutionName is mandatory');
  }

  if (!data.FinancialInstitutionBranchName || data.FinancialInstitutionBranchName.trim() === '') {
    errors.push('FinancialInstitutionBranchName is mandatory');
  }

  if (!data.AccountNumber || data.AccountNumber.trim() === '') {
    errors.push('AccountNumber is mandatory');
  }

  if (!data.AccountType || !isValidAccountType(data.AccountType)) {
    errors.push('AccountType is mandatory and must be "Savings" or "Current"');
  }

  // System
  if (!data.UpdatedBy || data.UpdatedBy.trim() === '') {
    errors.push('UpdatedBy is mandatory');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// BUSINESS CUSTOMER - MANDATORY FIELDS
// ============================================================================

export interface BusinessCustomerValidation {
  Command: string; // "Create" or "Update"
  BusinessName: string; // Mand
  CustomerStatus: string; // Mand - Pre-defined
  RegistrationDate: string; // Mand - Date, cannot be future
  UpdatedBy: string; // Mand
  PrimaryAddress: string; // Mand
  ProvinceName: string; // Mand
  DistrictName: string; // Mand
  CountryName: string; // Mand
  RegistrationNo: string; // Mand - Unique
  ContactNo: string; // Mand
  BusinessEmailID: string; // Mand - Valid email
  BranchName: string; // Mand
  NoOfPermanentEmployees: number; // Mand
  NoOfCasualEmployees: number; // Mand
  Sector: string; // Mand - Pre-defined
  BusinessPremisesType: string; // Mand - Pre-defined: Rented, Owned
  EntityType: string; // Mand - Pre-defined: Limited Co, Sole Proprietor, Partnership, Club, Others
  PINNo: string; // Mand
  VatNo: string; // Mand
  LeasePeriod: string; // Mand
  BalancePeriod: number; // Mand
  FinancialInstitutionName: string; // Mand
  FinancialInstitutionBranchName: string; // Mand
  AccountNumber: string; // Mand
  AccountType: string; // Mand - Pre-defined
  CustomerID?: string; // Mand for Update
}

export const validateBusinessCustomer = (data: Partial<BusinessCustomerValidation>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Command validation
  if (!data.Command || !isValidCommand(data.Command)) {
    errors.push('Command is mandatory and must be "Create" or "Update"');
  }

  // CustomerID validation for Update
  if (data.Command === 'Update' && !data.CustomerID) {
    errors.push('CustomerID is mandatory for Update command');
  }

  // Business Information
  if (!data.BusinessName || data.BusinessName.trim() === '') {
    errors.push('BusinessName is mandatory');
  }

  if (!data.CustomerStatus || !isValidCustomerStatus(data.CustomerStatus)) {
    errors.push('CustomerStatus is mandatory');
  }

  if (!data.RegistrationDate) {
    errors.push('RegistrationDate is mandatory');
  } else if (!isNotFutureDate(data.RegistrationDate)) {
    errors.push('RegistrationDate cannot be a future date');
  }

  if (!data.RegistrationNo || data.RegistrationNo.trim() === '') {
    errors.push('RegistrationNo is mandatory and must be unique');
  }

  if (!data.Sector || !isValidSector(data.Sector)) {
    errors.push('Sector is mandatory and must be valid');
  }

  if (!data.BusinessPremisesType || !isValidBusinessPremisesType(data.BusinessPremisesType)) {
    errors.push('BusinessPremisesType is mandatory and must be "Rented" or "Owned"');
  }

  if (!data.EntityType || !isValidEntityType(data.EntityType)) {
    errors.push('EntityType is mandatory and must be valid');
  }

  // Employee counts
  if (data.NoOfPermanentEmployees === undefined || data.NoOfPermanentEmployees === null) {
    errors.push('NoOfPermanentEmployees is mandatory');
  }

  if (data.NoOfCasualEmployees === undefined || data.NoOfCasualEmployees === null) {
    errors.push('NoOfCasualEmployees is mandatory');
  }

  // Tax Information
  if (!data.PINNo || data.PINNo.trim() === '') {
    errors.push('PINNo is mandatory');
  }

  if (!data.VatNo || data.VatNo.trim() === '') {
    errors.push('VatNo is mandatory');
  }

  // Lease Information
  if (!data.LeasePeriod || data.LeasePeriod.trim() === '') {
    errors.push('LeasePeriod is mandatory');
  }

  if (data.BalancePeriod === undefined || data.BalancePeriod === null) {
    errors.push('BalancePeriod is mandatory');
  }

  // Contact
  if (!data.ContactNo || data.ContactNo.trim() === '') {
    errors.push('ContactNo is mandatory');
  }

  if (!data.BusinessEmailID) {
    errors.push('BusinessEmailID is mandatory');
  } else if (!isValidEmail(data.BusinessEmailID)) {
    errors.push('BusinessEmailID must be a valid email address');
  }

  // Address
  if (!data.PrimaryAddress || data.PrimaryAddress.trim() === '') {
    errors.push('PrimaryAddress is mandatory');
  }

  if (!data.ProvinceName || data.ProvinceName.trim() === '') {
    errors.push('ProvinceName is mandatory');
  }

  if (!data.DistrictName || data.DistrictName.trim() === '') {
    errors.push('DistrictName is mandatory');
  }

  if (!data.CountryName || data.CountryName.trim() === '') {
    errors.push('CountryName is mandatory');
  }

  // Branch
  if (!data.BranchName || data.BranchName.trim() === '') {
    errors.push('BranchName is mandatory');
  }

  // Bank Details
  if (!data.FinancialInstitutionName || data.FinancialInstitutionName.trim() === '') {
    errors.push('FinancialInstitutionName is mandatory');
  }

  if (!data.FinancialInstitutionBranchName || data.FinancialInstitutionBranchName.trim() === '') {
    errors.push('FinancialInstitutionBranchName is mandatory');
  }

  if (!data.AccountNumber || data.AccountNumber.trim() === '') {
    errors.push('AccountNumber is mandatory');
  }

  if (!data.AccountType || !isValidAccountType(data.AccountType)) {
    errors.push('AccountType is mandatory and must be "Savings" or "Current"');
  }

  // System
  if (!data.UpdatedBy || data.UpdatedBy.trim() === '') {
    errors.push('UpdatedBy is mandatory');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// SALARIED LOAN REQUEST - MANDATORY FIELDS
// ============================================================================

export interface SalariedLoanRequestValidation {
  TypeOfCustomer: string; // Mand - "New" or "Existing"
  CustomerId?: string; // Mand for Existing customers
  IdentityNo: string; // Mand
  // Below fields ONLY for New customers:
  FirstName?: string; // Mand for New
  MiddleName?: string; // Optional
  LastName?: string; // Mand for New
  DateOfBirth?: string; // Mand for New
  // Common fields:
  ContactNo: string; // Mand
  EmailId: string; // Mand
  EmployeeNumber: string; // Mand
  Designation: string; // Mand
  EmployementType: string; // Mand - "1" or "2"
  Tenure: number; // Mand
  Gender: string; // Mand
  LoanAmount: number; // Mand
  GrossIncome: number; // Mand
  NetIncome: number; // Mand
  Deductions: number; // Mand
}

export const validateSalariedLoanRequest = (data: Partial<SalariedLoanRequestValidation>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Customer Type validation
  if (!data.TypeOfCustomer || !isValidCustomerType(data.TypeOfCustomer)) {
    errors.push('TypeOfCustomer is mandatory and must be "New" or "Existing"');
  }

  const isNewCustomer = data.TypeOfCustomer === 'New';

  // For Existing customers, CustomerId is mandatory
  if (!isNewCustomer && (!data.CustomerId || data.CustomerId.trim() === '')) {
    errors.push('CustomerId is mandatory for Existing customers');
  }

  // For New customers, personal details are mandatory
  if (isNewCustomer) {
    if (!data.FirstName || data.FirstName.trim() === '') {
      errors.push('FirstName is mandatory for New customers');
    }
    if (!data.LastName || data.LastName.trim() === '') {
      errors.push('LastName is mandatory for New customers');
    }
    if (!data.DateOfBirth) {
      errors.push('DateOfBirth is mandatory for New customers');
    } else {
      if (!isValidAge(data.DateOfBirth)) {
        errors.push('Customer must be at least 18 years old');
      }
      if (!isNotFutureDate(data.DateOfBirth)) {
        errors.push('DateOfBirth cannot be a future date');
      }
    }
  }

  // Common mandatory fields
  if (!data.IdentityNo || data.IdentityNo.trim() === '') {
    errors.push('IdentityNo is mandatory');
  }

  if (!data.ContactNo || data.ContactNo.trim() === '') {
    errors.push('ContactNo is mandatory');
  }

  if (!data.EmailId) {
    errors.push('EmailId is mandatory');
  } else if (!isValidEmail(data.EmailId)) {
    errors.push('EmailId must be a valid email address');
  }

  if (!data.EmployeeNumber || data.EmployeeNumber.trim() === '') {
    errors.push('EmployeeNumber is mandatory');
  }

  if (!data.Designation || data.Designation.trim() === '') {
    errors.push('Designation is mandatory');
  }

  if (!data.EmployementType || !isValidEmploymentType(data.EmployementType)) {
    errors.push('EmployementType is mandatory and must be "1" (Permanent) or "2" (Contract)');
  }

  if (!data.Gender || !isValidGender(data.Gender)) {
    errors.push('Gender is mandatory and must be "Male" or "Female"');
  }

  if (data.Tenure === undefined || data.Tenure === null || data.Tenure <= 0) {
    errors.push('Tenure is mandatory and must be greater than 0');
  }

  if (data.LoanAmount === undefined || data.LoanAmount === null || data.LoanAmount <= 0) {
    errors.push('LoanAmount is mandatory and must be greater than 0');
  }

  if (data.GrossIncome === undefined || data.GrossIncome === null || data.GrossIncome <= 0) {
    errors.push('GrossIncome is mandatory and must be greater than 0');
  }

  if (data.NetIncome === undefined || data.NetIncome === null || data.NetIncome <= 0) {
    errors.push('NetIncome is mandatory and must be greater than 0');
  }

  if (data.Deductions === undefined || data.Deductions === null) {
    errors.push('Deductions is mandatory (can be 0)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// BUSINESS LOAN REQUEST - MANDATORY FIELDS
// ============================================================================

export interface BusinessLoanRequestValidation {
  TypeOfCustomer: string; // Mand
  CustomerId?: string; // Mand for Existing
  CustomerName: string; // Mand
  IdentityNo: string; // Mand
  ContactNo: string; // Mand
  EmailId: string; // Mand
  EstimatedValueOfBusiness: string; // Mand
  GrossMonthlySales: string; // Mand
  Tenure: number; // Mand
  LoanAmount: number; // Mand
  InvoiceDetails: any; // Mand - Complex structure
}

export const validateBusinessLoanRequest = (data: Partial<BusinessLoanRequestValidation>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.TypeOfCustomer || !isValidCustomerType(data.TypeOfCustomer)) {
    errors.push('TypeOfCustomer is mandatory and must be "New" or "Existing"');
  }

  const isNewCustomer = data.TypeOfCustomer === 'New';

  if (!isNewCustomer && (!data.CustomerId || data.CustomerId.trim() === '')) {
    errors.push('CustomerId is mandatory for Existing customers');
  }

  if (!data.CustomerName || data.CustomerName.trim() === '') {
    errors.push('CustomerName is mandatory');
  }

  if (!data.IdentityNo || data.IdentityNo.trim() === '') {
    errors.push('IdentityNo is mandatory');
  }

  if (!data.ContactNo || data.ContactNo.trim() === '') {
    errors.push('ContactNo is mandatory');
  }

  if (!data.EmailId) {
    errors.push('EmailId is mandatory');
  } else if (!isValidEmail(data.EmailId)) {
    errors.push('EmailId must be a valid email address');
  }

  if (!data.EstimatedValueOfBusiness || data.EstimatedValueOfBusiness.trim() === '') {
    errors.push('EstimatedValueOfBusiness is mandatory');
  }

  if (!data.GrossMonthlySales || data.GrossMonthlySales.trim() === '') {
    errors.push('GrossMonthlySales is mandatory');
  }

  if (data.Tenure === undefined || data.Tenure === null || data.Tenure <= 0) {
    errors.push('Tenure is mandatory and must be greater than 0');
  }

  if (data.LoanAmount === undefined || data.LoanAmount === null || data.LoanAmount <= 0) {
    errors.push('LoanAmount is mandatory and must be greater than 0');
  }

  if (!data.InvoiceDetails) {
    errors.push('InvoiceDetails is mandatory');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// DOCUMENT UPLOAD - MANDATORY FIELDS
// ============================================================================

export interface DocumentUploadValidation {
  ApplicationNumber: string; // Mand
  TypeOfDocument: string; // Mand - Must be valid document type code
  DocumentNo: string; // Mand
  Document: {
    documentContent: string; // Mand - base64 encoded
    documentName: string; // Mand
  };
}

export const validateDocumentUpload = (data: Partial<DocumentUploadValidation>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.ApplicationNumber || data.ApplicationNumber.trim() === '') {
    errors.push('ApplicationNumber is mandatory');
  }

  if (!data.TypeOfDocument || data.TypeOfDocument.trim() === '') {
    errors.push('TypeOfDocument is mandatory');
  }

  if (!data.DocumentNo || data.DocumentNo.trim() === '') {
    errors.push('DocumentNo is mandatory');
  }

  if (!data.Document) {
    errors.push('Document is mandatory');
  } else {
    if (!data.Document.documentContent || data.Document.documentContent.trim() === '') {
      errors.push('Document.documentContent is mandatory (base64 encoded file)');
    }
    if (!data.Document.documentName || data.Document.documentName.trim() === '') {
      errors.push('Document.documentName is mandatory');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
