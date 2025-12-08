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
 * Updated with proper bank-branch associations based on ALTUS API mappings.
 * Keys are ALTUS FinancialInstitutionId values for direct API compatibility.
 */
export const bankBranchMap = {
  // ZNBS - Zambia National Building Society
  'BNK20201490000000622': [
    'Banking Society Business Park',
    'Mufulira',
    'Mpika',
    'Mansa',
    'Kapiri Mposhi',
    'Livingstone',
    'Mazabuka',
    'Mongu',
    'Luanshya',
    'Solwezi',
    'Kasama',
    'Society House',
    'Permanent House',
    'Kabwe',
    'Chipata',
    'Choma',
    'Soweto Agency',
    'Chililabombwe',
    'Chingola',
    'Nyimba',
    'Kitwe',
    'Ndola'
  ],

  // AB Bank
  'BNK20200430000000002': [
    'Head Office',
    'Cairo Main',
    'Chilenje',
    'Matero',
    'Kalinglinga',
    'Chelston',
    'Garden',
    'Kitwe'
  ],

  // Access Bank
  'BNK20200430000000006': [
    'Head Office',
    'Cairo Road',
    'Longacres',
    'Acacia',
    'Makeni',
    'Ndola',
    'Kitwe',
    'Solwezi'
  ],
  'BNK20203020000000662': [
    'Head Office',
    'Northend',
    'Longacres',
    'Arcades',
    'Ndola Centre Branch',
    'Kitwe',
    'Makeni',
    'Mansa Centre Branch',
    'Mbala Centre Branch',
    'Mbala Main Branch',
    'Ndola Main Branch',
    'City Mall Branch - Solwezi',
    'Solwezi Main Branch'
  ],

  // Atlas Mara Bank
  'BNK20200430000000007': [
    'Lusaka'
  ],

  // Bank of China
  'BNK20200430000000008': [
    'Lusaka',
    'Kitwe'
  ],

  // ABSA Bank
  'BNK20200440000000035': [
    'Head Office',
    'Head Office - Elunda',
    'Lusaka - Kamwala',
    'Lusaka - Northend',
    'Lusaka - Matero',
    'Lusaka Business Centre',
    'Lusaka Longacres',
    'Chilenje',
    'Lusaka Industrial',
    'University of Zambia Lusaka',
    'Soweto',
    'Chelstone',
    'Kabwata',
    'Lusaka - Chawama',
    'Manda Hill',
    'Lusaka Operation Processing Centre',
    'Kabelenga',
    'Elunda Premium Banking Centre',
    'Ndola Business Centre',
    'Ndola Operations Processing Centre',
    'Ndola - Masala',
    'Kitwe Business Centre',
    'Kitwe Chimwemwe',
    'Kitwe Parklands Center',
    'Kitwe Operations Processing Centre',
    'Chingola & Prestige',
    'Chililabombwe',
    'Mufulira & Prestige',
    'Kalulushi',
    'Luanshya',
    'Kasama',
    'Kabwe & Prestige',
    'Livingstone',
    'Chipata',
    'Choma',
    'Mbala',
    'Nakonde',
    'Mpika',
    'Mansa',
    'Mkushi',
    'Kapiri Mposhi',
    'Lundazi',
    'Mfuwe',
    'Solwezi',
    'Mongu',
    'Kafue',
    'Chirundu',
    'Mazabuka',
    'Monze',
    'Kalomo',
    'Petauke',
    'Chongwe',
    'Katete',
    'Chambishi',
    'Mumbwa',
    'Levy'
  ],
  'BNK20200830000000616': [
    'Petauke Branch',
    'Manda Hill Branch',
    'Matero Branch',
    'Mkushi Branch',
    'Mbala Branch Zambia',
    'Longacres Prestige Branch',
    'Lusaka Corporate Service Centre Branch',
    'Mansa Branch'
  ],

  // Cavmont Bank
  'BNK20200440000000036': [
    'Head Office',
    'Lusaka Square',
    'Lusaka South End',
    'Kalingalinga',
    'Tazara',
    'Garden',
    'Makumbi',
    'Bread of Life',
    'Ndola',
    'Kitwe'
  ],

  // Citibank Zambia
  'BNK20200450000000043': [
    'Lusaka'
  ],

  // Ecobank
  'BNK20200450000000044': [
    'Lusaka'
  ],

  // First Alliance Bank
  'BNK20200450000000046': [
    'Lusaka'
  ],

  // First Capital Bank
  'BNK20200450000000049': [
    'Lusaka'
  ],

  // First National Bank - Most comprehensive branch network
  'BNK20200480000000053': [
    'Commercial Suite',
    'Industrial',
    'FNB Operation Centre',
    'Head Office',
    'Electronic Banking',
    'Treasury',
    'Manda Hill',
    'Vehicle and Asset Finance',
    'Makeni Mall',
    'Home Loan',
    'Branchless Banking',
    'Electronic Wallet',
    'CIB Corporate',
    'Premier Banking',
    'Agriculture Centre',
    'Corporate Investment Banking',
    'Chilenje',
    'Cash Centre',
    'PHI Branch',
    'Cairo',
    'Kabulonga',
    'Ndola',
    'Jacaranda Mall',
    'Kitwe',
    'Mukuba Mall',
    'Kitwe Industrial',
    'Chingola',
    'Mufulira',
    'Luanshya',
    'Kabwe',
    'Livingstone',
    'Chipata',
    'Choma',
    'Mkushi',
    'Solwezi',
    'Kalumbila',
    'Mazabuka'
  ],
  'FNB': [
    'Commercial Suite',
    'Industrial',
    'FNB Operation Centre',
    'Head Office',
    'Electronic Banking',
    'Treasury',
    'Manda Hill',
    'Vehicle and Asset Finance',
    'Makeni Mall',
    'Home Loan',
    'Branchless Banking',
    'Electronic Wallet',
    'CIB Corporate',
    'Premier Banking',
    'Agriculture Centre',
    'Corporate Investment Banking',
    'Chilenje',
    'Cash Centre',
    'PHI Branch',
    'Cairo',
    'Kabulonga',
    'Ndola',
    'Jacaranda Mall',
    'Kitwe',
    'Mukuba Mall',
    'Kitwe Industrial',
    'Chingola',
    'Mufulira',
    'Luanshya',
    'Kabwe',
    'Livingstone',
    'Chipata',
    'Choma',
    'Mkushi',
    'Solwezi',
    'Kalumbila',
    'Mazabuka'
  ],

  // Indo Zambia Bank
  'BNK20200520000000062': [
    'Lusaka'
  ],

  // Intermarket Banking Corporation
  'BNK20200520000000065': [
    'Lusaka'
  ],

  // Investrust Bank
  'BNK20200550000000081': [
    'Lusaka'
  ],

  // National Savings and Credit Bank
  'BNK20200760000000614': [
    'Cosmopolitan'
  ],

  // Natsave
  'BNK20201490000000621': [
    'Chama',
    'Chavuma',
    'Chilubi Island',
    'Chimwemwe',
    'Chinsali',
    'Chipata',
    'Choma',
    'Chongwe',
    'Kabwe',
    'Kalabo',
    'Kaputa',
    'Kasama',
    'Kasempa',
    'Kazungula',
    'Kitwe',
    'Livingstone',
    'Luanshya',
    'Lumwana',
    'Lufwanyama',
    'Lukulu',
    'Credit Centre',
    'Lusaka Chilenje',
    'Lusaka Main Branch',
    'Lusaka Matero',
    'Lusaka Northend',
    'Luwingu',
    'Mansa',
    'Mongu',
    'Mpika',
    'Mporokoso',
    'Mpongwe',
    'Mumbwa',
    'Mwense',
    'Nchelenge',
    'Ndola',
    'Petauke',
    'Solwezi',
    'Zambezi',
    'Head office',
    'Cosmopolitan'
  ],

  // New Bank
  'BNK20200690000000253': [
    'Lusaka'
  ],

  // Stanbic Bank Zambia
  'BNK20200590000000113': [
    'Head Office',
    'Lusaka',
    'Lusaka Industrial',
    'Matero',
    'Mulungushi',
    'Soweto',
    'Kabwata',
    'Private Banking',
    'Kabulonga',
    'Woodlands',
    'Waterfall',
    'Cosmopolitan Mall',
    'East Park Mall',
    'Ndola Main',
    'Arcades',
    'Ndola South',
    'Kafubu Mall',
    'Kitwe',
    'Chisokone',
    'Mukuba Mall',
    'Chingola',
    'Mufulira',
    'Kabwe',
    'Livingstone',
    'Chipata',
    'Choma',
    'Mkushi',
    'Solwezi',
    'Kafue',
    'Mazabuka',
    'Lumwana',
    'Chambishi'
  ],
  'Stanbic Bank': [
    'Head Office',
    'Lusaka',
    'Lusaka Industrial',
    'Matero',
    'Mulungushi',
    'Soweto',
    'Kabwata',
    'Private Banking',
    'Kabulonga',
    'Woodlands',
    'Waterfall',
    'Cosmopolitan Mall',
    'East Park Mall',
    'Ndola Main',
    'Arcades',
    'Ndola South',
    'Kafubu Mall',
    'Kitwe',
    'Chisokone',
    'Mukuba Mall',
    'Chingola',
    'Mufulira',
    'Kabwe',
    'Livingstone',
    'Chipata',
    'Choma',
    'Mkushi',
    'Solwezi',
    'Kafue',
    'Mazabuka',
    'Lumwana',
    'Chambishi'
  ],
  'Stanbic': [
    'Head Office',
    'Lusaka',
    'Lusaka Industrial',
    'Matero',
    'Mulungushi',
    'Soweto',
    'Kabwata',
    'Private Banking',
    'Kabulonga',
    'Woodlands',
    'Waterfall',
    'Cosmopolitan Mall',
    'East Park Mall',
    'Ndola Main',
    'Arcades',
    'Ndola South',
    'Kafubu Mall',
    'Kitwe',
    'Chisokone',
    'Mukuba Mall',
    'Chingola',
    'Mufulira',
    'Kabwe',
    'Livingstone',
    'Chipata',
    'Choma',
    'Mkushi',
    'Solwezi',
    'Kafue',
    'Mazabuka',
    'Lumwana',
    'Chambishi'
  ],

  // Standard Chartered Bank Zambia
  'BNK20200590000000119': [
    'Lusaka'
  ],
  'Standard Chartered': [
    'Lusaka'
  ],

  // The United Bank of Zambia
  'BNK20200590000000120': [
    'Lusaka'
  ],

  // United Bank for Africa
  'BNK20200590000000121': [
    'Lusaka'
  ],

  // Zambia Industrial Commercial Bank
  'BNK20200590000000122': [
    'Lusaka'
  ],

  // Zambia National Commercial Bank
  'BNK20200590000000123': [
    'Head Office',
    'Lusaka Main Branch',
    'Ndola',
    'Kitwe',
    'Livingstone',
    'Kasama',
    'Chipata'
  ],

  // Bayport Financial Services
  'BNK20213160000000663': [
    'Lusaka Business Centre'
  ],

  // FAB
  'BNK20222300000000664': [
    'Lusaka Main Branch'
  ]
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
 * Get branches for a specific bank using ALTUS FinancialInstitutionId
 */
export const getBranchesForBank = (bankId: string): readonly string[] => {
  return bankBranchMap[bankId as BankName] || allValidBranches;
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
 * Check if a bank is FNB using ALTUS FinancialInstitutionId
 */
export const isFNBBank = (bankId: string): boolean => {
  return bankId === 'BNK20200480000000053'; // FNB ALTUS ID
};

/**
 * Get validation warning for non-FNB banks using ALTUS ID
 */
export const getNonFNBWarning = (bankId: string): string | null => {
  if (isFNBBank(bankId)) {
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
