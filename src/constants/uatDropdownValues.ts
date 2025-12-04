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
  "AB Bank": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch"],
  "Access Bank": ["Lusaka Branch", "Kitwe Branch", "Livingstone Branch"],
  "Access Bank Zambia Limited": ["Lusaka Main Branch", "Copperbelt Branch", "Southern Branch"],
  "Atlas Mara Bank": ["Lusaka - HQ", "Kitwe", "Livingstone", "Kasama", "Solwezi", "Ndola", "Mansa", "Mongu", "Choma", "Chipata", "Lusaka CBD", "Kabwe", "Cairo"],
  "Bank of China": ["Lusaka Branch", "Ndola Branch"],
  "ABSA Zambia": ["Lusaka Main Branch", "East Park Mall", "Kitwe Branch", "Ndola Branch", "Livingstone Branch"],
  "Absa": ["Lusaka Main Branch", "East Park Mall", "Kitwe Branch", "Ndola Branch", "Livingstone Branch"],
  "Cavmont Bank": ["Lusaka Branch", "Kitwe Branch"],
  "Citibank Zambia": ["Lusaka Branch", "Ndola Branch"],
  "Ecobank": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch", "Livingstone Branch"],
  "First Alliance Bank": ["Lusaka Branch", "Kitwe Branch", "Ndola Branch"],
  "First Capital Bank": ["Lusaka Branch", "Kitwe Branch"],
  "First National Bank": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch", "Livingstone Branch"],
  "Indo Zambia Bank": ["Lusaka Main Branch", "Manda Hill Branch", "Kitwe Branch", "Ndola Branch"],
  "Intermarket Banking Corporation": ["Lusaka Branch", "Kitwe Branch"],
  "Investrust Bank": ["Lusaka Branch", "Kitwe Branch", "Ndola Branch"],
  "Stanbic Bank Zambia": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch", "Livingstone Branch"],
  "Standard Chartered Bank Zambia": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch", "Livingstone Branch"],
  "The United Bank of Zambia": ["Lusaka Branch", "Kitwe Branch", "Ndola Branch"],
  "United Bank for Africa": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch"],
  "Zambia Industrial Commercial Bank": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch", "Livingstone Branch"],
  "Zambia National Commercial Bank": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch", "Livingstone Branch", "Kasama Branch"],
  "New Bank": ["Lusaka Branch", "Kitwe Branch"],
  "National Savings and Credit Bank": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch", "Livingstone Branch"],
  "Natsave": ["Lusaka Main Branch", "Kitwe Branch", "Ndola Branch", "Livingstone Branch"],
  "ZNBS": ["Lusaka Branch", "Kitwe Branch"],
  "Bayport Financial Services": ["Lusaka Branch", "Nationwide"],
  "FAB": ["Lusaka Branch", "Kitwe Branch", "Ndola Branch"]
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