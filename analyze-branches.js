/**
 * Complete List of Valid ALTUS Branches
 * Compiled from actual API error messages (December 3, 2025)
 * 
 * This is the definitive list based on real API responses.
 */

// First error message branches (21 branches)
const errorMessage1 = "Head Office, Lusaka Square, Lusaka South End, Kalingalinga, Tazara, Garden, Makumbi, Bread of Life, Ndola, Kitwe, Kitwe Agency, Chililabombwe, Chingola, Kasama, Chipata, Mpulungu, Mbala, Mansa, Solwezi, Mufumbwe, Mwense";

// Second error message branches (8 branches)
const errorMessage2 = "Petauke Branch, Manda Hill Branch, Matero Branch, Mkushi Branch, Mbala Branch Zambia, Longacres Prestige Branch, Lusaka Corporate Service Centre Branch, Mansa Branch";

// Parse and combine
const branches1 = errorMessage1.split(', ').map(b => b.trim());
const branches2 = errorMessage2.split(', ').map(b => b.trim());

// Combine and deduplicate
const allBranches = [...new Set([...branches1, ...branches2])].sort();

console.log('📋 Complete List of Valid ALTUS Branches from API Errors');
console.log('='.repeat(60));
console.log(`Total unique branches: ${allBranches.length}\n`);

allBranches.forEach((branch, index) => {
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${branch}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n📊 TypeScript Array Format:\n');

console.log('export const validProductionBranches = [');
allBranches.forEach(branch => {
  console.log(`  '${branch}',`);
});
console.log('] as const;\n');

// Group by potential province
console.log('📍 Grouped by Location (estimated):\n');

const lusakaBranches = allBranches.filter(b => 
  b.includes('Lusaka') || 
  b.includes('Longacres') || 
  b.includes('Kalingalinga') || 
  b.includes('Tazara') || 
  b.includes('Garden') || 
  b.includes('Makumbi') ||
  b.includes('Bread of Life') ||
  b.includes('Manda Hill') ||
  b.includes('Matero')
);

const copperbeltBranches = allBranches.filter(b => 
  b.includes('Ndola') || 
  b.includes('Kitwe') || 
  b.includes('Chililabombwe') || 
  b.includes('Chingola')
);

const northernBranches = allBranches.filter(b => 
  b.includes('Kasama') || 
  b.includes('Mpulungu') || 
  b.includes('Mbala')
);

const luapulaBranches = allBranches.filter(b => 
  b.includes('Mansa') || 
  b.includes('Mwense')
);

const northWesternBranches = allBranches.filter(b => 
  b.includes('Solwezi') || 
  b.includes('Mufumbwe')
);

const easternBranches = allBranches.filter(b => 
  b.includes('Chipata') || 
  b.includes('Petauke')
);

const centralBranches = allBranches.filter(b => 
  b.includes('Mkushi')
);

console.log(`Lusaka (${lusakaBranches.length}):`);
lusakaBranches.forEach(b => console.log(`  - ${b}`));

console.log(`\nCopperbelt (${copperbeltBranches.length}):`);
copperbeltBranches.forEach(b => console.log(`  - ${b}`));

console.log(`\nNorthern (${northernBranches.length}):`);
northernBranches.forEach(b => console.log(`  - ${b}`));

console.log(`\nLuapula (${luapulaBranches.length}):`);
luapulaBranches.forEach(b => console.log(`  - ${b}`));

console.log(`\nNorth-Western (${northWesternBranches.length}):`);
northWesternBranches.forEach(b => console.log(`  - ${b}`));

console.log(`\nEastern (${easternBranches.length}):`);
easternBranches.forEach(b => console.log(`  - ${b}`));

console.log(`\nCentral (${centralBranches.length}):`);
centralBranches.forEach(b => console.log(`  - ${b}`));

const otherBranches = allBranches.filter(b => 
  !lusakaBranches.includes(b) &&
  !copperbeltBranches.includes(b) &&
  !northernBranches.includes(b) &&
  !luapulaBranches.includes(b) &&
  !northWesternBranches.includes(b) &&
  !easternBranches.includes(b) &&
  !centralBranches.includes(b)
);

if (otherBranches.length > 0) {
  console.log(`\nOther/Unclassified (${otherBranches.length}):`);
  otherBranches.forEach(b => console.log(`  - ${b}`));
}
