/**
 * Branch Validation Test Script
 * 
 * This script tests all candidate branch names against the ALTUS API
 * to determine which branches are actually accepted.
 * 
 * Usage: node test-branches.js
 */

const axios = require('axios');

// All candidate branches from our current list + any known variations
const candidateBranches = [
  // Production API branches (from error messages)
  'Head Office',
  'Lusaka Square',
  'Lusaka South End',
  'Kalingalinga',
  'Tazara',
  'Garden',
  'Makumbi',
  'Bread of Life',
  'Ndola',
  'Kitwe',
  'Kitwe Agency',
  'Chililabombwe',
  'Chingola',
  'Kasama',
  'Chipata',
  'Mpulungu',
  'Mbala',
  'Mansa',
  'Solwezi',
  'Mufumbwe',
  'Mwense',
  'Petauke Branch',
  'Manda Hill Branch',
  'Matero Branch',
  'Mkushi Branch',
  'Mbala Branch Zambia',
  'Longacres Prestige Branch',
  'Lusaka Corporate Service Centre Branch',
  'Mansa Branch',
  
  // UAT branches
  'Commercial Suite',
  'Industrial',
  'FNB Operation Centre',
  'Electronic Banking',
  'Treasury',
  'Vehicle and Asset Finance',
  'Home Loan',
  'Branchless Banking',
  'Electronic Wallet',
  'CIB Corporate',
  'Premier Banking',
  'Agriculture Centre',
  'Corporate Investment Banking',
  'Cash Centre',
  'PHI Branch',
  'Manda Hill',
  'Makeni Mall',
  'Chilenje',
  'Cairo',
  'Kabulonga',
  'Jacaranda Mall',
  'Mukuba Mall',
  'Kitwe Industrial',
  'Mufulira',
  'Luanshya',
  'Kabwe',
  'Mkushi',
  'Livingstone',
  'Choma',
  'Mazabuka',
  'Kalumbila',
];

// API configuration
const API_BASE_URL = 'http://41.72.214.12:5013';
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI5MiIsInVuaXF1ZV9uYW1lIjoiY2hpbWJ1c28iLCJyb2xlIjoiQWRtaW4iLCJuYmYiOjE3MzIwMTI4OTcsImV4cCI6MTczNDYwNDg5NywiaWF0IjoxNzMyMDEyODk3fQ._EQ-TRVWPl03LrCcZQPHXREuLR0gVj3YmwTf7KO4ysA';

// Minimal test payload
const createTestPayload = (branchName) => ({
  header: {
    source: "Web Portal",
    apikey: "ALTUS-API-KEY-2024",
    securityToken: BEARER_TOKEN
  },
  body: {
    TypeOfCustomer: "New",
    CustomerId: "",
    FirstName: "Test",
    MiddleName: "",
    LastName: "BranchValidator",
    DateOfBirth: "01/01/1990 00:00:00",
    IdentityNo: "123456/78/1",
    ContactNo: "0971234567",
    EmailId: "test@example.com",
    PrimaryAddress: "Test Address",
    ProvinceName: "Lusaka",
    DistrictName: "Lusaka",
    CountryName: "Zambia",
    Postalcode: "10101",
    EmployeeNumber: "EMP001",
    Designation: "Test",
    EmployerName: "Test Employer",
    EmploymentType: "1",
    Tenure: 12,
    LoanAmount: 5000,
    GrossIncome: 10000,
    NetIncome: 8500,
    Deductions: 1500,
    Gender: "Male",
    FinancialInstitutionName: "First National Bank",
    FinancialInstitutionBranchName: branchName,
    AccountNumber: "1234567890",
    AccountType: "Savings",
    ReferrerName: "",
    ReferrerNRC: "",
    ReferrerContactNo: "",
    ReferrerPhysicalAddress: "",
    ReferrerRelationType: "",
    KinName: "Test Kin",
    KinNRC: "987654/32/1",
    KinRelationship: "Sibling",
    KinMobileNo: "0977654321",
    KinAddress: "Kin Address",
    KinProvinceName: "Lusaka",
    KinDistrictName: "Lusaka",
    KinCountryName: "Zambia"
  }
});

// Test a single branch
async function testBranch(branchName) {
  try {
    const payload = createTestPayload(branchName);
    const response = await axios.post(
      `${API_BASE_URL}/API/LoanRequest/Salaried`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const data = response.data;
    
    // Check if the branch was accepted
    if (data.executionStatus === 'Success') {
      return { branch: branchName, valid: true, message: 'SUCCESS' };
    } else if (data.executionMessage && data.executionMessage.includes('FinancialInstitutionBranch')) {
      // Extract valid branches from error message if present
      const match = data.executionMessage.match(/Valid FinancialInstitutionBranch - (.+)/);
      return { branch: branchName, valid: false, message: data.executionMessage, validBranches: match ? match[1] : null };
    } else {
      return { branch: branchName, valid: false, message: data.executionMessage || 'Unknown error' };
    }
  } catch (error) {
    if (error.response?.data?.executionMessage) {
      const msg = error.response.data.executionMessage;
      if (msg.includes('FinancialInstitutionBranch')) {
        const match = msg.match(/Valid FinancialInstitutionBranch - (.+)/);
        return { branch: branchName, valid: false, message: msg, validBranches: match ? match[1] : null };
      }
      return { branch: branchName, valid: false, message: msg };
    }
    return { branch: branchName, valid: false, error: error.message };
  }
}

// Test all branches with rate limiting
async function testAllBranches() {
  console.log('🔍 Starting Branch Validation Test...');
  console.log(`📋 Testing ${candidateBranches.length} candidate branches\n`);

  const results = {
    valid: [],
    invalid: [],
    errors: [],
    validBranchesFromAPI: new Set()
  };

  for (let i = 0; i < candidateBranches.length; i++) {
    const branch = candidateBranches[i];
    console.log(`[${i + 1}/${candidateBranches.length}] Testing: "${branch}"`);

    const result = await testBranch(branch);

    if (result.valid) {
      console.log(`  ✅ VALID`);
      results.valid.push(branch);
    } else if (result.validBranches) {
      console.log(`  ❌ INVALID (got valid branches list)`);
      results.invalid.push(branch);
      // Parse and add valid branches from error message
      result.validBranches.split(', ').forEach(b => results.validBranchesFromAPI.add(b.trim()));
    } else if (result.error) {
      console.log(`  ⚠️  ERROR: ${result.error}`);
      results.errors.push({ branch, error: result.error });
    } else {
      console.log(`  ❌ INVALID: ${result.message?.substring(0, 100)}...`);
      results.invalid.push(branch);
    }

    // Rate limiting - wait 500ms between requests
    if (i < candidateBranches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n✅ Valid Branches (${results.valid.length}):`);
  results.valid.forEach(b => console.log(`   - ${b}`));

  console.log(`\n❌ Invalid Branches (${results.invalid.length}):`);
  results.invalid.forEach(b => console.log(`   - ${b}`));

  if (results.errors.length > 0) {
    console.log(`\n⚠️  Errors (${results.errors.length}):`);
    results.errors.forEach(e => console.log(`   - ${e.branch}: ${e.error}`));
  }

  if (results.validBranchesFromAPI.size > 0) {
    console.log(`\n🎯 Valid Branches from API Error Messages (${results.validBranchesFromAPI.size}):`);
    const sortedBranches = Array.from(results.validBranchesFromAPI).sort();
    sortedBranches.forEach(b => console.log(`   - ${b}`));

    // Find missing branches
    const missing = sortedBranches.filter(b => !candidateBranches.includes(b));
    if (missing.length > 0) {
      console.log(`\n🔴 MISSING from our list (${missing.length}):`);
      missing.forEach(b => console.log(`   - ${b}`));
    }
  }

  console.log('\n' + '='.repeat(80));
  
  return results;
}

// Run the test
testAllBranches().then(() => {
  console.log('\n✅ Branch validation test complete!');
}).catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
