/**
 * Update Branches Script
 * 
 * Automated script to check for new FNB branches by:
 * 1. Fetching latest branch list from FNB website
 * 2. Comparing with our current list
 * 3. Reporting any differences
 * 4. Optionally updating the bankBranches.ts file
 * 
 * Usage:
 *   ts-node src/scripts/updateBranches.ts [--dry-run] [--update]
 * 
 * Options:
 *   --dry-run   Only check for differences, don't update files
 *   --update    Automatically update bankBranches.ts with new branches
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Import current branches
const BANK_BRANCHES_FILE = path.join(__dirname, '../constants/bankBranches.ts');

// Current production branches (hardcoded for comparison)
const CURRENT_BRANCHES = [
  'Manda Hill Branch',
  'Lusaka Main Branch',
  'Northmead Branch',
  'Chilenje Branch',
  'Woodlands Branch',
  'Kabwe Branch',
  'Solwezi Branch',
  'Chingola Branch',
  'Mufulira Branch',
  'Kitwe Branch',
  'Ndola Main Branch',
  'Mongu Branch',
  'Kabwe',
  'Livingstone Branch',
  'Luanshya',
  'Cairo Road',
  'Manda Hill',
  'Northmead',
  'Zambia',
  'Kafue',
  'Mazabuka',
  'Chirundu',
  'Kasama',
  'Mpika',
  'Mansa',
  'Monze',
  'Mpongwe',
  'Choma',
  'Mansa Branch',
];

interface BranchCheckResult {
  newBranches: string[];
  removedBranches: string[];
  unchangedBranches: string[];
  totalCurrent: number;
  totalFetched: number;
}

/**
 * Fetch branch list from FNB Zambia website
 * Note: This is a placeholder implementation as we don't have the actual FNB API
 */
async function fetchFNBBranches(): Promise<string[]> {
  console.log('🔍 Attempting to fetch branches from FNB Zambia website...\n');

  try {
    // Try FNB Zambia website
    const response = await axios.get('https://www.fnbzambia.com/branches', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const branches: string[] = [];

    // Try to scrape branch names (adjust selectors based on actual website)
    $('.branch-name, .location-name, [data-branch]').each((_, element) => {
      const branchName = $(element).text().trim();
      if (branchName && branchName.length > 0) {
        branches.push(branchName);
      }
    });

    if (branches.length > 0) {
      console.log(`✅ Successfully scraped ${branches.length} branches from website\n`);
      return branches;
    }

    console.log('⚠️  Could not scrape branches from website\n');
    return [];
  } catch (error) {
    console.log(`⚠️  Error fetching from FNB website: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    return [];
  }
}

/**
 * Test ALTUS API with sample branches to discover new valid branches
 */
async function testALTUSAPI(): Promise<string[]> {
  console.log('🧪 Testing ALTUS API to discover valid branches...\n');

  const ALTUS_API_URL = 'http://41.72.214.12:5013/api/loan-request/create';
  const discoveredBranches: string[] = [];

  // Sample test data
  const testPayload = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '0977123456',
    nrc: '123456/78/9',
    loanAmount: 5000,
    loanTerm: 6,
    purpose: 'Personal',
    // Branch will be tested here
    financialInstitutionBranchName: 'TEST_BRANCH',
  };

  try {
    // Note: This would require a valid test environment
    // For now, we'll return empty array
    console.log('⚠️  ALTUS API testing requires valid credentials and test environment\n');
    console.log('💡 Recommended: Parse recent error logs for "Valid FinancialInstitutionBranch" messages\n');
    
    return discoveredBranches;
  } catch (error) {
    console.log(`⚠️  Could not test ALTUS API: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    return discoveredBranches;
  }
}

/**
 * Parse error logs to extract valid branches from ALTUS error messages
 */
function parseErrorLogs(logFilePath?: string): string[] {
  console.log('📋 Parsing error logs for valid branch names...\n');

  const logsDir = path.join(__dirname, '../../logs');
  const discoveredBranches = new Set<string>();

  try {
    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      console.log('⚠️  Logs directory not found. Skipping log analysis.\n');
      return [];
    }

    // Read all log files
    const logFiles = fs.readdirSync(logsDir).filter(f => f.endsWith('.log') || f.endsWith('.txt'));

    if (logFiles.length === 0) {
      console.log('⚠️  No log files found. Skipping log analysis.\n');
      return [];
    }

    console.log(`📂 Found ${logFiles.length} log file(s)\n`);

    logFiles.forEach((logFile) => {
      const logContent = fs.readFileSync(path.join(logsDir, logFile), 'utf-8');

      // Regex to match: "Please enter Valid FinancialInstitutionBranch - [branch1, branch2, ...]"
      const regex = /Please enter Valid FinancialInstitutionBranch\s*-\s*\[(.*?)\]/g;
      let match;

      while ((match = regex.exec(logContent)) !== null) {
        const branchList = match[1];
        const branches = branchList
          .split(',')
          .map(b => b.trim())
          .filter(b => b.length > 0);

        branches.forEach(branch => discoveredBranches.add(branch));
      }
    });

    if (discoveredBranches.size > 0) {
      console.log(`✅ Extracted ${discoveredBranches.size} unique branches from error logs\n`);
    } else {
      console.log('ℹ️  No valid branch errors found in logs\n');
    }

    return Array.from(discoveredBranches).sort();
  } catch (error) {
    console.log(`⚠️  Error parsing logs: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    return [];
  }
}

/**
 * Compare current branches with fetched branches
 */
function compareBranches(currentBranches: string[], fetchedBranches: string[]): BranchCheckResult {
  const currentSet = new Set(currentBranches);
  const fetchedSet = new Set(fetchedBranches);

  const newBranches = fetchedBranches.filter(b => !currentSet.has(b));
  const removedBranches = currentBranches.filter(b => !fetchedSet.has(b));
  const unchangedBranches = currentBranches.filter(b => fetchedSet.has(b));

  return {
    newBranches: newBranches.sort(),
    removedBranches: removedBranches.sort(),
    unchangedBranches: unchangedBranches.sort(),
    totalCurrent: currentBranches.length,
    totalFetched: fetchedBranches.length,
  };
}

/**
 * Update bankBranches.ts file with new branches
 */
function updateBankBranchesFile(allBranches: string[]): void {
  console.log('📝 Updating bankBranches.ts file...\n');

  try {
    const fileContent = fs.readFileSync(BANK_BRANCHES_FILE, 'utf-8');

    // Find the allValidBranches array and replace it
    const branchesArrayString = allBranches.map(b => `  '${b}',`).join('\n');
    const newArray = `export const allValidBranches = [\n${branchesArrayString}\n] as const;`;

    // Replace the existing array
    const regex = /export const allValidBranches = \[[\s\S]*?\] as const;/;
    const updatedContent = fileContent.replace(regex, newArray);

    // Write back to file
    fs.writeFileSync(BANK_BRANCHES_FILE, updatedContent, 'utf-8');

    console.log('✅ Successfully updated bankBranches.ts\n');
  } catch (error) {
    console.error(`❌ Error updating file: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    throw error;
  }
}

/**
 * Display comparison results
 */
function displayResults(result: BranchCheckResult): void {
  console.log('═══════════════════════════════════════════════════════');
  console.log('                 BRANCH COMPARISON RESULTS              ');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`📊 Current branches: ${result.totalCurrent}`);
  console.log(`📊 Fetched branches: ${result.totalFetched}`);
  console.log(`✅ Unchanged branches: ${result.unchangedBranches.length}\n`);

  if (result.newBranches.length > 0) {
    console.log(`🆕 NEW BRANCHES (${result.newBranches.length}):`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    result.newBranches.forEach((branch, i) => {
      console.log(`  ${i + 1}. ${branch}`);
    });
    console.log('');
  } else {
    console.log('✅ No new branches found\n');
  }

  if (result.removedBranches.length > 0) {
    console.log(`⚠️  REMOVED BRANCHES (${result.removedBranches.length}):`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    result.removedBranches.forEach((branch, i) => {
      console.log(`  ${i + 1}. ${branch}`);
    });
    console.log('');
  } else {
    console.log('✅ No branches removed\n');
  }

  console.log('═══════════════════════════════════════════════════════\n');
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const shouldUpdate = args.includes('--update');

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║          ALTUS BRANCH UPDATE SCRIPT                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('\n');

  if (isDryRun) {
    console.log('🔍 Running in DRY RUN mode - no files will be updated\n');
  }

  // Try multiple sources for branch data
  let fetchedBranches: string[] = [];

  // 1. Try parsing error logs first (most reliable)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Step 1: Checking error logs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const logBranches = parseErrorLogs();
  if (logBranches.length > 0) {
    fetchedBranches = logBranches;
  }

  // 2. Try FNB website if logs didn't work
  if (fetchedBranches.length === 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Step 2: Trying FNB Zambia website');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const websiteBranches = await fetchFNBBranches();
    if (websiteBranches.length > 0) {
      fetchedBranches = websiteBranches;
    }
  }

  // 3. Test ALTUS API as last resort
  if (fetchedBranches.length === 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Step 3: Testing ALTUS API');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const apiBranches = await testALTUSAPI();
    if (apiBranches.length > 0) {
      fetchedBranches = apiBranches;
    }
  }

  // If no branches found, use current branches
  if (fetchedBranches.length === 0) {
    console.log('⚠️  Could not fetch branches from any source. Using current branches for comparison.\n');
    fetchedBranches = CURRENT_BRANCHES;
  }

  // Compare branches
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Comparing branches');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const result = compareBranches(CURRENT_BRANCHES, fetchedBranches);
  displayResults(result);

  // Update file if requested and there are changes
  if (shouldUpdate && !isDryRun && result.newBranches.length > 0) {
    const allBranches = [...CURRENT_BRANCHES, ...result.newBranches].sort();
    
    console.log('🔄 Updating bankBranches.ts with new branches...\n');
    updateBankBranchesFile(allBranches);
    
    console.log('✅ COMPLETE! Branch file has been updated.\n');
    console.log('⚠️  IMPORTANT: Remember to:\n');
    console.log('   1. Review the changes in bankBranches.ts');
    console.log('   2. Update locationConstants.ts with province mappings');
    console.log('   3. Run tests: npm test branchValidation.test.ts');
    console.log('   4. Test the application thoroughly\n');
  } else if (shouldUpdate && isDryRun) {
    console.log('ℹ️  DRY RUN mode - no files were updated\n');
  } else if (!shouldUpdate && result.newBranches.length > 0) {
    console.log('💡 To update the file, run with --update flag:\n');
    console.log('   ts-node src/scripts/updateBranches.ts --update\n');
  } else {
    console.log('✅ No updates needed - all branches are current!\n');
  }

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                    SCRIPT COMPLETE                    ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Script failed with error:\n');
  console.error(error);
  process.exit(1);
});
