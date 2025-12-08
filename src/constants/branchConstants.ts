/**
 * ALTUS API Valid Branch Names
 * From actual API error response - these are the REAL valid branches from the backend
 * These are the ONLY valid values for FinancialInstitutionBranchName field
 */

export const ALTUS_VALID_BRANCHES = [
  "Commercial Suite",
  "Industrial",
  "FNB Operation Centre",
  "Head Office",
  "Electronic Banking",
  "Treasury",
  "Manda Hill",
  "Vehicle and Asset Finance",
  "Makeni Mall",
  "Home Loan",
  "Branchless Banking",
  "Electronic Wallet",
  "CIB Corporate",
  "Premier Banking",
  "Agriculture Centre",
  "Corporate Investment Banking",
  "Chilenje",
  "Cash Centre",
  "PHI Branch",
  "Cairo",
  "Kabulonga",
  "Ndola",
  "Jacaranda Mall",
  "Kitwe",
  "Mukuba Mall",
  "Kitwe Industrial",
  "Chingola",
  "Mufulira",
  "Luanshya",
  "Kabwe",
  "Livingstone",
  "Chipata",
  "Choma",
  "Mkushi",
  "Solwezi",
  "Kalumbila",
  "Mazabuka"
];

/**
 * Get the default/closest branch based on province
 * Maps Zambian provinces to primary branch locations
 */
export const getDefaultBranchForProvince = (province: string): string => {
  const provinceMap: Record<string, string> = {
    // Lusaka Province
    "Lusaka": "Head Office",
    
    // Copperbelt Province
    "Copperbelt": "Ndola",
    "Ndola": "Ndola",
    "Kitwe": "Kitwe",
    "Mufulira": "Mufulira",
    "Chingola": "Chingola",
    "Luanshya": "Luanshya",
    
    // Central Province
    "Central": "Kabwe",
    "Kabwe": "Kabwe",
    
    // Eastern Province
    "Eastern": "Chipata",
    "Chipata": "Chipata",
    
    // Southern Province
    "Southern": "Livingstone",
    "Livingstone": "Livingstone",
    "Choma": "Choma",
    "Mazabuka": "Mazabuka",
    
    // Northern Province
    "Northern": "Kabwe",
    
    // Northwestern Province
    "Northwestern": "Solwezi",
    "Solwezi": "Solwezi",
  };
  
  const normalizedProvince = province?.trim() || "";
  return provinceMap[normalizedProvince] || "Head Office"; // Default to Head Office if not found
};

/**
 * Validate if a branch name is valid according to ALTUS API requirements
 */
export const isValidBranchName = (branchName: string): boolean => {
  if (!branchName || typeof branchName !== 'string') {
    return false;
  }
  return ALTUS_VALID_BRANCHES.includes(branchName.trim());
};

/**
 * Get best matching branch from partial input
 * Useful for autocomplete or fuzzy matching
 */
export const getBranchByPartialMatch = (partialName: string): string | null => {
  if (!partialName || typeof partialName !== 'string') {
    return null;
  }
  
  const normalized = partialName.trim().toLowerCase();
  
  // Exact match (case-insensitive)
  const exactMatch = ALTUS_VALID_BRANCHES.find(
    branch => branch.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;
  
  // Partial match (starts with)
  const startsWith = ALTUS_VALID_BRANCHES.find(
    branch => branch.toLowerCase().startsWith(normalized)
  );
  if (startsWith) return startsWith;
  
  // Partial match (contains)
  const contains = ALTUS_VALID_BRANCHES.find(
    branch => branch.toLowerCase().includes(normalized)
  );
  if (contains) return contains;
  
  return null;
};
