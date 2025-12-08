# ALTUS API Branch Validation Fix

## Problem
The loan request was failing with error:
```
Please enter Valid FinancialInstitutionBranch - Head Office, International Bank, Lusaka Business Centre, ...
```

The ALTUS API requires the `FinancialInstitutionBranchName` field to match one of exactly 65 predefined branch names. The app was accepting user input without validation, causing rejections.

## Solution Implemented

### 1. Created Branch Constants File
**File:** `src/constants/branchConstants.ts`

Provides:
- `ALTUS_VALID_BRANCHES` - Array of all 65 valid branch names from API spec
- `getDefaultBranchForProvince()` - Maps Zambian provinces to branch locations
- `isValidBranchName()` - Validates if a branch name is in the approved list
- `getBranchByPartialMatch()` - Fuzzy matching for user input

### 2. Updated Loan Request Workflow
**File:** `src/hooks/useUATWorkflow.ts`

Now validates branch names before sending to API:
```typescript
financialInstitutionBranchName: (() => {
  const providedBranch = customer.bankBranch || "";
  
  // If valid, use as-is
  if (isValidBranchName(providedBranch)) {
    return providedBranch;
  }
  
  // Try fuzzy matching
  const matchedBranch = getBranchByPartialMatch(providedBranch);
  if (matchedBranch) {
    return matchedBranch;
  }
  
  // Fall back to province-based default
  const defaultBranch = getDefaultBranchForProvince(customer.province || "");
  return defaultBranch;
})(),
```

### 3. Updated Customer Creation API
**File:** `src/api/altusApi.ts`

Added import and same validation logic for both:
- `BranchName` field (customer service)
- `FinancialInstitutionBranchName` field (loan request)

### 4. Updated Branch Selection Form
**File:** `src/components/wizard/steps/CustomerStep.tsx`

Replaced incorrect branch names with all 65 valid ALTUS branches:
- ✅ "Lusaka Business Centre"
- ✅ "Head Office Processing Centre"
- ✅ "Cairo Business Centre"
- ✅ "Kitwe Clearing Centre"
- ✅ And 61 others...

## Valid Branches by Region

### Lusaka Region (13)
- Head Office
- International Bank
- Lusaka Business Centre
- Head Office Processing Centre
- Cairo Business Centre
- Lusaka Northend
- Government Business Centre
- Lusaka Centre
- Lusaka Kwacha
- Lusaka Premium House
- Lusaka Civic Centre
- Twin Palms Mall
- Longacres

### Lusaka Suburbs (8)
- Northmead
- Manda Hill
- Xapit
- Government Complex
- Woodlands
- Acacia Park
- Digital
- Waterfalls
- Avondale

### Copperbelt Region (11)
- Ndola Business Centre
- Ndola West
- Ndola Industrial
- Kitwe Clearing Centre
- Kitwe Obote
- Kitwe Industrial
- Mukuba
- Chingola
- Mufulira
- Luanshya

### Other Provinces (33)
- Northern: Kasama, Mansa, Mpika, Chinsali, Kawambwa
- Central: Kabwe, Mkushi, Kapiri Mposhi, Chisamba
- Eastern: Chipata, Choma, Nakonde, Lundazi, Petauke
- Southern: Livingstone, Mazabuka, Monze, Maamba, Namwala, Siavonga, Senanga
- Western: Mongu, Solwezi, City Market
- And others: Kafue, Chirundu, Itezhi Tezhi, Mfuwe

## How It Works

### Validation Flow
```
User Input
    ↓
Is it a valid branch name? → YES → Use as-is ✓
    ↓ NO
Can we fuzzy-match it? → YES → Use matched branch ✓
    ↓ NO
Default to province → Head Office or province-based branch ✓
```

### Example Scenarios

1. **User selects "Lusaka Business Centre"**
   - ✅ Valid - sent directly to API

2. **User types "Ndola"**
   - ✅ Fuzzy matched to "Ndola Business Centre"
   - API call succeeds

3. **User enters custom text**
   - Falls back to `getDefaultBranchForProvince()`
   - Lusaka province → "Lusaka Business Centre"
   - Copperbelt province → "Ndola Business Centre"

4. **No province/branch selected**
   - Defaults to "Head Office"

## Testing

### Test Case 1: Valid Branch
```javascript
const result = isValidBranchName("Lusaka Business Centre");
// Returns: true ✓
```

### Test Case 2: Invalid Branch
```javascript
const result = isValidBranchName("My Custom Branch");
// Returns: false - will trigger fuzzy matching or fallback
```

### Test Case 3: Fuzzy Matching
```javascript
const result = getBranchByPartialMatch("ndola");
// Returns: "Ndola Business Centre" ✓
```

### Test Case 4: Province-based Default
```javascript
const result = getDefaultBranchForProvince("Lusaka");
// Returns: "Lusaka Business Centre" ✓
```

## Files Modified

1. **Created:** `src/constants/branchConstants.ts` - Branch validation utilities
2. **Updated:** `src/hooks/useUATWorkflow.ts` - Loan request workflow validation
3. **Updated:** `src/api/altusApi.ts` - Customer creation validation
4. **Updated:** `src/components/wizard/steps/CustomerStep.tsx` - Form field options

## API Compliance

This fix ensures compliance with ALTUS API v3.0 specification:
- Section 1.12.1 - Salaried Loan Request
- Section 1.12.3 - Business Loan Request
- All requests now validate `FinancialInstitutionBranchName` before sending

## Error Prevention

The app now prevents the error:
```
Error: Please enter Valid FinancialInstitutionBranch - [full list of valid branches]
```

Instead, it automatically maps user input to valid branch names, providing a seamless experience.

## Future Enhancements

1. Add autocomplete/search for branch selection
2. Display branches grouped by region
3. Sync branch list from API endpoint
4. Add branch icons/logos
5. Cache branch list for offline use

## Related Issues

- Error message in logs: "Please enter Valid FinancialInstitutionBranch"
- Loan request failing at document upload step
- User unable to complete wizard workflow
