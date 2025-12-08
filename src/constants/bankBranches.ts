/**
 * ALTUS API - Valid Bank Branch Mapping
 * 
 * This file contains the complete, accurate mapping of all major Zambian banks
 * to their exact ALTUS-accepted branch names.
 * 
 * ⚠️ CRITICAL: ALTUS Production API accepts ONLY these exact branch names.
 * Any deviation will result in validation errors from the backend.
 * 
 * Last verified: December 3, 2025
 * Source: ALTUS Production API error messages (confirmed by actual API responses)
 */

// ============================================================================
// ALTUS-ACCEPTED BRANCH NAMES (29 Production Branches - CONFIRMED)
// ============================================================================

/**
 * Complete list of all valid ALTUS branch names.
 * These are the ONLY 29 branch names accepted by the ALTUS Production API.
 * 
 * This list is compiled from ACTUAL API error messages received on Dec 3, 2025.
 * All branches have been confirmed by real production API responses.
 */
export const allValidBranches = [
  // ========== PRODUCTION API BRANCHES (CONFIRMED BY API) ==========
  // These 29 branches are the ONLY branches accepted by ALTUS Production API
  
  // Lusaka Province (11 branches + 1 HQ)
  'Head Office',
  'Lusaka Square',
  'Lusaka South End',
  'Lusaka Corporate Service Centre Branch',
  'Kalingalinga',
  'Tazara',
  'Garden',
  'Makumbi',
  'Bread of Life',
  'Longacres Prestige Branch',
  'Manda Hill Branch',
  'Matero Branch',
  
  // Copperbelt Province (5 branches)
  'Ndola',
  'Kitwe',
  'Kitwe Agency',
  'Chililabombwe',
  'Chingola',
  
  // Northern Province (4 branches)
  'Kasama',
  'Mpulungu',
  'Mbala',
  'Mbala Branch Zambia',
  
  // Luapula Province (3 branches)
  'Mansa',
  'Mansa Branch',
  'Mwense',
  
  // Eastern Province (2 branches)
  'Chipata',
  'Petauke Branch',
  
  // North-Western Province (2 branches)
  'Solwezi',
  'Mufumbwe',
  
  // Central Province (1 branch)
  'Mkushi Branch',
] as const;

// Type-safe branch name type
export type ValidBranchName = typeof allValidBranches[number];

// ============================================================================
// BANK-TO-BRANCH MAPPING
// ============================================================================

/**
 * Mapping of Zambian banks to their ALTUS-accepted branch names.
 * 
 * NOTE: Currently, ALTUS UAT primarily accepts FNB branch names.
 * Other banks are included for future expansion and frontend flexibility.
 */
export const bankBranchMap = {
  // First National Bank - Primary bank with full branch coverage
  'First National Bank': allValidBranches,
  'FNB': allValidBranches,
  'First National Bank Zambia': allValidBranches,
  
  // Other major banks - Using FNB branch names for ALTUS compatibility
  // These can be expanded when ALTUS adds bank-specific branch validation
  'Stanbic Bank Zambia': allValidBranches,
  'Stanbic Bank': allValidBranches,
  'Stanbic': allValidBranches,
  
  'ABSA Zambia': allValidBranches,
  'Absa': allValidBranches,
  'Barclays Bank Zambia': allValidBranches, // Legacy name
  
  'Standard Chartered Bank Zambia': allValidBranches,
  'Standard Chartered': allValidBranches,
  
  'Zambia National Commercial Bank': allValidBranches,
  'Zanaco': allValidBranches,
  'ZNBC': allValidBranches,
  
  'Indo Zambia Bank': allValidBranches,
  'Indo-Zambia Bank': allValidBranches,
  'IZB': allValidBranches,
  
  'Investrust Bank': allValidBranches,
  'Investrust': allValidBranches,
  
  // Additional banks
  'Access Bank': allValidBranches,
  'Access Bank Zambia Limited': allValidBranches,
  'Cavmont Bank': allValidBranches,
  'Ecobank': allValidBranches,
  'First Capital Bank': allValidBranches,
  'United Bank for Africa': allValidBranches,
  'Citibank Zambia': allValidBranches,
  'Atlas Mara Bank': allValidBranches,
  'Bank of China': allValidBranches,
  'National Savings and Credit Bank': allValidBranches,
  'Natsave': allValidBranches,
  'Bayport Financial Services': allValidBranches,
} as const satisfies Record<string, readonly string[]>;

// Type-safe bank name type
export type BankName = keyof typeof bankBranchMap;

// ============================================================================
// BRANCH GROUPING BY PROVINCE/REGION
// ============================================================================

/**
 * Branches grouped by geographic location for better UX.
 * Used for grouped dropdowns and regional filtering.
 * 
 * All branches confirmed by Production API (29 total).
 */
export const branchGroups = {
  'Lusaka Province - Head Office': [
    'Head Office',
    'Lusaka Corporate Service Centre Branch',
  ] as const,
  
  'Lusaka Province - Retail Branches': [
    'Lusaka Square',
    'Lusaka South End',
    'Kalingalinga',
    'Tazara',
    'Garden',
    'Makumbi',
    'Bread of Life',
    'Longacres Prestige Branch',
    'Manda Hill Branch',
    'Matero Branch',
  ] as const,
  
  'Copperbelt Province': [
    'Ndola',
    'Kitwe',
    'Kitwe Agency',
    'Chililabombwe',
    'Chingola',
  ] as const,
  
  'Northern Province': [
    'Kasama',
    'Mpulungu',
    'Mbala',
    'Mbala Branch Zambia',
  ] as const,
  
  'Luapula Province': [
    'Mansa',
    'Mansa Branch',
    'Mwense',
  ] as const,
  
  'Eastern Province': [
    'Chipata',
    'Petauke Branch',
  ] as const,
  
  'North-Western Province': [
    'Solwezi',
    'Mufumbwe',
  ] as const,
  
  'Central Province': [
    'Mkushi Branch',
  ] as const,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the province/region group for a given branch name
 */
export const getBranchGroup = (branchName: string): string | null => {
  for (const [group, branches] of Object.entries(branchGroups)) {
    if ((branches as readonly string[]).includes(branchName)) {
      return group;
    }
  }
  return null;
};

/**
 * Validate if a branch name is accepted by ALTUS
 */
export const isValidBranch = (branchName: string): boolean => {
  return allValidBranches.includes(branchName as any);
};

/**
 * Get branches for a specific bank
 */
export const getBranchesForBank = (bankName: string): readonly string[] => {
  return bankBranchMap[bankName as BankName] || allValidBranches;
};

/**
 * Get all available bank names
 */
export const getAllBankNames = (): string[] => {
  return Object.keys(bankBranchMap);
};

/**
 * Search/filter branches by partial match (case-insensitive)
 */
export const searchBranches = (query: string, bankName?: string): string[] => {
  const branches = bankName ? getBranchesForBank(bankName) : allValidBranches;
  const lowerQuery = query.toLowerCase();
  return branches.filter(branch => 
    branch.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Check if a bank is FNB (fully validated by ALTUS)
 */
export const isFNBBank = (bankName: string): boolean => {
  const fnbVariants = ['First National Bank', 'FNB', 'First National Bank Zambia'];
  return fnbVariants.includes(bankName);
};

/**
 * Get validation warning for non-FNB banks
 */
export const getNonFNBWarning = (bankName: string): string | null => {
  if (isFNBBank(bankName)) {
    return null;
  }
  return `⚠️ Warning: Only FNB branches are fully validated by ALTUS API. Other banks may cause validation errors. We recommend using FNB for guaranteed approval.`;
};

/**
 * Validate bank and branch combination
 */
export const validateBankBranch = (bankName: string, branchName: string): {
  isValid: boolean;
  error?: string;
  warning?: string;
} => {
  // Check if branch is in the valid list
  if (!isValidBranch(branchName)) {
    return {
      isValid: false,
      error: `Invalid branch: "${branchName}". Must be one of the 29 ALTUS-approved branches.`
    };
  }

  // Check if it's a non-FNB bank
  const warning = getNonFNBWarning(bankName);
  
  return {
    isValid: true,
    warning: warning || undefined
  };
};

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

export default {
  allValidBranches,
  bankBranchMap,
  branchGroups,
  getBranchGroup,
  isValidBranch,
  getBranchesForBank,
  getAllBankNames,
  searchBranches,
  isFNBBank,
  getNonFNBWarning,
  validateBankBranch,
};
