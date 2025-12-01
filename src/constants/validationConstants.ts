// Validation constants from API V2 documentation
// These are pre-defined values that must match exactly

export const VALID_CUSTOMER_STATUS = ['Active', 'Dormant', 'BlackListed', 'Deceased', 'InActive'] as const;
export type CustomerStatus = typeof VALID_CUSTOMER_STATUS[number];

export const VALID_GENDER = ['Male', 'Female'] as const;
export type Gender = typeof VALID_GENDER[number];

export const VALID_TITLE = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'] as const;
export type Title = typeof VALID_TITLE[number];

export const VALID_BUSINESS_PREMISES_TYPE = ['Rented', 'Owned'] as const;
export type BusinessPremisesType = typeof VALID_BUSINESS_PREMISES_TYPE[number];

export const VALID_ENTITY_TYPE = [
  'Limited Co',
  'Sole Proprietor',
  'Partnership',
  'Club',
  'Others'
] as const;
export type EntityType = typeof VALID_ENTITY_TYPE[number];

export const VALID_SECTOR = [
  'Manufacturing',
  'Agriculture',
  'Mining',
  'Tourism',
  'Energy',
  'Construction',
  'Transportation',
  'Telecommunication',
  'IT Services',
  'Education',
  'HealthCare',
  'Others'
] as const;
export type Sector = typeof VALID_SECTOR[number];

export const VALID_EMPLOYMENT_TYPE = ['1', '2'] as const; // 1=Permanent, 2=Contract
export type EmploymentType = typeof VALID_EMPLOYMENT_TYPE[number];

export const VALID_CUSTOMER_TYPE = ['New', 'Existing'] as const;
export type CustomerType = typeof VALID_CUSTOMER_TYPE[number];

export const VALID_LOAN_TYPE = ['1', '2'] as const; // 1=Payroll Back Loan, 2=SME Term Loan
export type LoanType = typeof VALID_LOAN_TYPE[number];

export const VALID_COMMAND = ['Create', 'Update'] as const;
export type Command = typeof VALID_COMMAND[number];

export const VALID_ACCOUNT_TYPE = ['Savings', 'Current'] as const;
export type AccountType = typeof VALID_ACCOUNT_TYPE[number];

export const VALID_REQUEST_STATUS = ['0', '1'] as const; // 0=Pending, 1=Approved/Rejected
export type RequestStatus = typeof VALID_REQUEST_STATUS[number];

// Document Type Codes from API V2 documentation
export const DOCUMENT_TYPES = {
  ORDER_COPIES: '30',
  ARTICLES_OF_ASSOCIATION: '16',
  BOARD_RESOLUTION: '14',
  COMPANY_PROFILE: '15',
  BUSINESS_REG_CITY_COUNCIL: '3',
  BUSINESS_REG_PACRA: '2',
  PASSPORT: '17',
  EMPLOYMENT_CONTRACT: '29',
  NRC_CLIENT: '6',
  NRC_SPOUSE: '7',
  RESIDENCE_PERMIT: '28',
  WORK_PERMIT: '27',
  PAYSLIP_3_MONTHS: '18'
} as const;

export const DOCUMENT_TYPE_NAMES: Record<string, string> = {
  '30': 'Order Copies',
  '16': 'Articles of Association',
  '14': 'Board Resolution',
  '15': 'Company Profile',
  '3': 'Business Registration (City Council)',
  '2': 'Business Registration (PACRA)',
  '17': 'Passport',
  '29': 'Employment Contract',
  '6': 'NRC ID (Client)',
  '7': 'NRC ID (Spouse)',
  '28': 'Residence Permit',
  '27': 'Work Permit',
  '18': 'Payslip (Last 3 months)'
};

// Validation helper functions
export const isValidCustomerStatus = (status: string): status is CustomerStatus => {
  return VALID_CUSTOMER_STATUS.includes(status as CustomerStatus);
};

export const isValidGender = (gender: string): gender is Gender => {
  return VALID_GENDER.includes(gender as Gender);
};

export const isValidTitle = (title: string): title is Title => {
  return VALID_TITLE.includes(title as Title);
};

export const isValidSector = (sector: string): sector is Sector => {
  return VALID_SECTOR.includes(sector as Sector);
};

export const isValidEmploymentType = (type: string): type is EmploymentType => {
  return VALID_EMPLOYMENT_TYPE.includes(type as EmploymentType);
};

export const isValidCustomerType = (type: string): type is CustomerType => {
  return VALID_CUSTOMER_TYPE.includes(type as CustomerType);
};

export const isValidCommand = (cmd: string): cmd is Command => {
  return VALID_COMMAND.includes(cmd as Command);
};

export const isValidAccountType = (type: string): type is AccountType => {
  return VALID_ACCOUNT_TYPE.includes(type as AccountType);
};

export const isValidBusinessPremisesType = (type: string): type is BusinessPremisesType => {
  return VALID_BUSINESS_PREMISES_TYPE.includes(type as BusinessPremisesType);
};

export const isValidEntityType = (type: string): type is EntityType => {
  return VALID_ENTITY_TYPE.includes(type as EntityType);
};

// Age validation
export const isValidAge = (dateOfBirth: string): boolean => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  return age >= 18;
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Future date validation
export const isNotFutureDate = (date: string): boolean => {
  const checkDate = new Date(date);
  const today = new Date();
  return checkDate <= today;
};
