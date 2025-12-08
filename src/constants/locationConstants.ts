/**
 * Location Constants for ALTUS Loan Application
 *
 * Contains provinces, cities, and their relationships for cascading dropdowns.
 * Based on the 29 confirmed ALTUS Production API branches.
 *
 * Last updated: December 6, 2025
 */

// ============================================================================
// PROVINCES
// ============================================================================

export const provinces = [
  'Central',
  'Copperbelt',
  'Eastern',
  'Luapula',
  'Lusaka',
  'Muchinga',
  'Northern',
  'North-Western',
  'Southern',
  'Western',
  'Others'
] as const;

export type ProvinceName = typeof provinces[number];

// ============================================================================
// CITIES/DISTRICTS BY PROVINCE
// ============================================================================

/**
 * Cities and districts grouped by province.
 * Based on the comprehensive DISTRICT_ID_MAP from ALTUS API.
 * Corrected province-district mappings based on administrative divisions.
 */
export const citiesByProvince: Record<string, readonly string[]> = {
  'Central': [
    'Kabwe',
    'Chibombo',
    'Itezhi-tezhi',
    'Shibuyunji',
    'Kapiri Mposhi',
    'Chitambo',
    'Luano',
    'Mkushi',
    'Mumbwa',
    'Ngabwe',
    'Chisamba',
    'Serenje'
  ] as const,

  'Copperbelt': [
    'Chililabombwe',
    'Chingola',
    'Kalulushi',
    'Kitwe',
    'Luanshya',
    'Lufwanyama',
    'Masaiti',
    'Mpongwe',
    'Mufulira',
    'Ndola',
    'Chambishi'
  ] as const,

  'Eastern': [
    'Chadiza',
    'Chasefu',
    'Chipangali',
    'Chipata',
    'Kasenengwa',
    'Katete',
    'Lumezi',
    'Lundazi',
    'Lusangazi',
    'Mambwe',
    'Nyimba',
    'Petauke',
    'Sinda District',
    'Vubwi'
  ] as const,

  'Luapula': [
    'Chembe',
    'Chiengi',
    'Chifunabuli',
    'Chipili',
    'Kawambwa',
    'Lunga',
    'Mansa',
    'Milenge',
    'Mwansabombwe',
    'Mwense',
    'Nchelenge',
    'Samfya'
  ] as const,

  'Lusaka': [
    'Chilanga',
    'Chongwe',
    'Kafue',
    'Luangwa',
    'Lusaka',
    'Rufunsa'
  ] as const,

  'Muchinga': [
    'Chinsali',
    'Chama',
    'Isoka',
    'Mafinga',
    'Mpika',
    'Nakonde',
    'Shiwang\'andu',
    'Lavushimanda',
    'Kanchibiya'
  ] as const,

  'Northern': [
    'Chilubi',
    'Kaputa',
    'Kasama',
    'Luwingu',
    'Mbala',
    'Mporokoso',
    'Mpulungu',
    'Mungwi',
    'Lupososhi',
    'Senga Hill',
    'Lunte',
    'Nsama'
  ] as const,

  'North-Western': [
    'Chavuma',
    'Ikelenge',
    'Kabompo',
    'Kalumbila',
    'Kasempa',
    'Manyinga',
    'Mufumbwe',
    'Mushindamo',
    'Mwinilunga',
    'Solwezi'
  ] as const,

  'Southern': [
    'Chikankata',
    'Choma',
    'Chirundu',
    'Gwembe',
    'Itezhi Tehzi',
    'Kalomo',
    'Kazungula',
    'Mazabuka',
    'Monze',
    'Namwala',
    'Livingstone',
    'Pemba',
    'Siavonga',
    'Sinazongwe',
    'Zimba'
  ] as const,

  'Western': [
    'Kaoma',
    'Kalabo',
    'Limulunga',
    'Luampa',
    'Lukulu',
    'Mitete',
    'Mongu',
    'Mulobezi',
    'Mwandi',
    'Nalolo',
    'Nkeyema',
    'Senanga',
    'Sesheke',
    'Shangombo',
    'Sikongo',
    'Sioma'
  ] as const,

  'Others': [] as const
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
