/**
 * Location Constants for ALTUS Loan Application
 * 
 * Contains provinces, cities, and their relationships for cascading dropdowns.
 * Based on the 29 confirmed ALTUS Production API branches.
 * 
 * Last updated: December 3, 2025
 */

// ============================================================================
// PROVINCES
// ============================================================================

export const provinces = [
  'Lusaka Province',
  'Copperbelt Province',
  'Northern Province',
  'Luapula Province',
  'Eastern Province',
  'North-Western Province',
  'Central Province',
  'Southern Province', // Added for future expansion
] as const;

export type ProvinceName = typeof provinces[number];

// ============================================================================
// CITIES/DISTRICTS BY PROVINCE
// ============================================================================

/**
 * Cities and districts grouped by province.
 * Inferred from branch locations and Zambian geography.
 */
export const citiesByProvince: Record<string, readonly string[]> = {
  'Lusaka Province': [
    'Lusaka',
    'Lusaka CBD',
    'Kalingalinga',
    'Matero',
    'Chilenje',
    'Kabulonga',
    'Longacres',
    'Garden Compound',
  ] as const,
  
  'Copperbelt Province': [
    'Ndola',
    'Kitwe',
    'Chingola',
    'Chililabombwe',
    'Mufulira',
    'Luanshya',
  ] as const,
  
  'Northern Province': [
    'Kasama',
    'Mpulungu',
    'Mbala',
  ] as const,
  
  'Luapula Province': [
    'Mansa',
    'Mwense',
  ] as const,
  
  'Eastern Province': [
    'Chipata',
    'Petauke',
  ] as const,
  
  'North-Western Province': [
    'Solwezi',
    'Mufumbwe',
    'Kasempa',
  ] as const,
  
  'Central Province': [
    'Kabwe',
    'Mkushi',
    'Kapiri Mposhi',
  ] as const,
  
  'Southern Province': [
    'Livingstone',
    'Choma',
    'Mazabuka',
    'Kalomo',
  ] as const,
} as const;

// ============================================================================
// BANK BRANCHES BY PROVINCE
// ============================================================================

/**
 * Bank branches grouped by province.
 * These are the 29 CONFIRMED branches accepted by ALTUS Production API.
 * 
 * DO NOT modify unless confirmed by actual API error messages.
 */
export const branchByProvince: Record<string, readonly string[]> = {
  'Lusaka Province': [
    'Head Office',
    'Lusaka Corporate Service Centre Branch',
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
  
  'Southern Province': [
    // No branches confirmed yet - placeholder for future
  ] as const,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all cities for a given province
 */
export const getCitiesForProvince = (province: string): readonly string[] => {
  return citiesByProvince[province] || [];
};

/**
 * Get all branches for a given province
 */
export const getBranchesForProvince = (province: string): readonly string[] => {
  return branchByProvince[province] || [];
};

/**
 * Get province for a given branch
 */
export const getProvinceForBranch = (branchName: string): string | null => {
  for (const [province, branches] of Object.entries(branchByProvince)) {
    if ((branches as readonly string[]).includes(branchName)) {
      return province;
    }
  }
  return null;
};

/**
 * Get all available branch names across all provinces
 */
export const getAllBranches = (): string[] => {
  return Object.values(branchByProvince).flat();
};

/**
 * Validate if a province exists
 */
export const isValidProvince = (province: string): boolean => {
  return provinces.includes(province as any);
};

export default {
  provinces,
  citiesByProvince,
  branchByProvince,
  getCitiesForProvince,
  getBranchesForProvince,
  getProvinceForBranch,
  getAllBranches,
  isValidProvince,
};
