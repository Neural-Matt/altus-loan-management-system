export const PROVINCES = [
  "Central",
  "Copperbelt",
  "Eastern",
  "Luapula",
  "Lusaka",
  "Muchinga",
  "Northern",
  "North-Western",
  "Southern",
  "Western"
] as const;

export const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  "Central": ["Kabwe", "Kapiri Mposhi", "Mkushi", "Mumbwa", "Serenje"],
  "Copperbelt": ["Chililabombwe", "Chingola", "Kalulushi", "Kitwe", "Luanshya", "Lufwanyama", "Masaiti", "Mpongwe", "Mufulira", "Ndola"],
  "Eastern": ["Chadiza", "Chama", "Chipata", "Katete", "Lundazi", "Mambwe", "Nyimba", "Petauke", "Sinda"],
  "Luapula": ["Chembe", "Chiengi", "Chipili", "Kawambwa", "Lunga", "Mansa", "Milenge", "Mwansabombwe", "Nchelenge", "Samfya"],
  "Lusaka": ["Chilanga", "Chirundu", "Kafue", "Luangwa", "Lusaka"],
  "Muchinga": ["Chinsali", "Isoka", "Kanchibiya", "Lavushimanda", "Mafinga", "Mpika", "Nakonde", "Shiwa Ngandu"],
  "Northern": ["Kasama", "Lunte", "Lupososhi", "Mporokoso", "Mpulungu", "Mungwi", "Nsama", "Senga Hill"],
  "North-Western": ["Chavuma", "Ikelenge", "Kabompo", "Kalumbila", "Kasempa", "Manyinga", "Mufumbwe", "Mwinilunga", "Solwezi", "Zambezi"],
  "Southern": ["Choma", "Gwembe", "Itezhi-Tezhi", "Kalomo", "Kazungula", "Livingstone", "Mazabuka", "Monze", "Namwala", "Pemba", "Siavonga", "Sinazongwe", "Zimba"],
  "Western": ["Kalabo", "Kaoma", "Limulunga", "Luampa", "Lukulu", "Mitete", "Mongu", "Mulobezi", "Mwandi", "Nalolo", "Senanga", "Sesheke", "Shangombo", "Sikongo", "Sioma"]
};

export const BANKS = [
  "AB Bank",
  "Access Bank",
  "Access Bank Zambia Limited",
  "Atlas Mara Bank",
  "Bank of China",
  "ABSA Zambia",
  "Absa",
  "Cavmont Bank",
  "Citibank Zambia",
  "Ecobank",
  "First Alliance Bank",
  "First Capital Bank",
  "First National Bank",
  "Indo Zambia Bank",
  "Intermarket Banking Corporation",
  "Investrust Bank",
  "Stanbic Bank Zambia",
  "Standard Chartered Bank Zambia",
  "The United Bank of Zambia",
  "United Bank for Africa",
  "Zambia Industrial Commercial Bank",
  "Zambia National Commercial Bank",
  "New Bank",
  "National Savings and Credit Bank",
  "Natsave",
  "ZNBS",
  "Bayport Financial Services",
  "FAB"
] as const;

export const BRANCHES_BY_BANK: Record<string, string[]> = {
  // TODO: Update with exact values from ALTUS-UAT-Key-and-Values.csv
  // This is a placeholder - need to extract from CSV
  "AB Bank": ["Head Office"],
  "Access Bank": ["Head Office"],
  "Access Bank Zambia Limited": ["Head Office"],
  "Atlas Mara Bank": ["Head Office"],
  "Bank of China": ["Head Office"],
  "ABSA Zambia": ["Head Office"],
  "Absa": ["Head Office"],
  "Cavmont Bank": ["Head Office"],
  "Citibank Zambia": ["Head Office"],
  "Ecobank": ["Head Office"],
  "First Alliance Bank": ["Head Office"],
  "First Capital Bank": ["Head Office"],
  "First National Bank": ["Head Office"],
  "Indo Zambia Bank": ["Head Office"],
  "Intermarket Banking Corporation": ["Head Office"],
  "Investrust Bank": ["Head Office"],
  "Stanbic Bank Zambia": ["Head Office"],
  "Standard Chartered Bank Zambia": ["Head Office"],
  "The United Bank of Zambia": ["Head Office"],
  "United Bank for Africa": ["Head Office"],
  "Zambia Industrial Commercial Bank": ["Head Office"],
  "Zambia National Commercial Bank": ["Head Office"],
  "New Bank": ["Head Office"],
  "National Savings and Credit Bank": ["Head Office"],
  "Natsave": ["Head Office"],
  "ZNBS": ["Head Office"],
  "Bayport Financial Services": ["Head Office"],
  "FAB": ["Head Office"]
};

export const ACCOUNT_TYPES = ["Savings", "Current", "Fixed Deposit"] as const;

export const RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Relative",
  "Friend",
  "Colleague"
] as const;

export const TITLES = ["Mr", "Mrs", "Miss", "Ms", "Dr"] as const;

export const GENDERS = ["Male", "Female"] as const;

export const SECTORS = [
  "Agriculture",
  "Manufacturing",
  "Services",
  "Construction",
  "Mining",
  "Retail",
  "Finance",
  "Education",
  "Health",
  "Other"
] as const;

export const BUSINESS_PREMISES_TYPES = [
  "Owned",
  "Rented",
  "Leased",
  "Family Property",
  "Other"
] as const;

export const ENTITY_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Private Company",
  "Public Company",
  "Cooperative",
  "NGO",
  "Other"
] as const;

export const DOCUMENT_TYPES = [
  "National ID",
  "Passport",
  "Birth Certificate",
  "Marriage Certificate",
  "Payslip",
  "Bank Statement",
  "Utility Bill",
  "Business License",
  "Tax Certificate",
  "Other"
] as const;