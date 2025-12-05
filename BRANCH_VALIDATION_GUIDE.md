## Quick Reference: Using ALTUS Branch Validation

### For Developers

#### Import the helpers
```typescript
import { 
  ALTUS_VALID_BRANCHES,
  getDefaultBranchForProvince,
  isValidBranchName,
  getBranchByPartialMatch
} from '../constants/branchConstants';
```

#### Validate a branch name
```typescript
// Check if branch is valid
if (isValidBranchName(userInput)) {
  // Safe to send to API
  submitLoanRequest({ 
    financialInstitutionBranchName: userInput 
  });
}

// Get a matching branch from partial input
const matched = getBranchByPartialMatch("lusaka");
if (matched) {
  console.log(matched); // "Lusaka Business Centre"
}

// Get default for a province
const defaultBranch = getDefaultBranchForProvince("Lusaka");
console.log(defaultBranch); // "Lusaka Business Centre"
```

#### Use in forms
```typescript
// In CustomerStep.tsx
<FormTextField 
  name="bankBranch" 
  control={control} 
  label="Bank Branch"
  select
>
  {ALTUS_VALID_BRANCHES.map(branch => (
    <MenuItem key={branch} value={branch}>
      {branch}
    </MenuItem>
  ))}
</FormTextField>
```

#### Handle in hooks
```typescript
// In useUATWorkflow.ts
const branchName = (() => {
  const provided = customer.bankBranch || "";
  
  if (isValidBranchName(provided)) return provided;
  
  const matched = getBranchByPartialMatch(provided);
  if (matched) return matched;
  
  return getDefaultBranchForProvince(customer.province || "");
})();
```

### For QA/Testing

#### Valid Inputs (will pass)
```
"Head Office"
"Lusaka Business Centre"
"Ndola Business Centre"
"Kitwe Clearing Centre"
```

#### Invalid Inputs (will be mapped/fallback)
```
"lusaka" → Matched to "Lusaka Business Centre"
"ndola" → Matched to "Ndola Business Centre"
"random text" → Falls back to province default
"" → Falls back to province default
```

#### Test Different Provinces
```
Lusaka → "Lusaka Business Centre"
Copperbelt → "Ndola Business Centre"
Northern → "Kasama"
Eastern → "Chipata"
Southern → "Livingstone"
Western → "Mongu"
Central → "Kabwe"
```

### Debugging

#### Check if error is branch-related
```
Error message contains: "FinancialInstitutionBranch"
```

#### Add logging to see mapping
```typescript
const branch = isValidBranchName(input) 
  ? input 
  : (getBranchByPartialMatch(input) || getDefaultBranchForProvince(province));

console.log('Using branch:', branch); // Shows resolved branch
```

#### List all valid branches
```typescript
import { ALTUS_VALID_BRANCHES } from '../constants/branchConstants';

console.log('Valid branches:', ALTUS_VALID_BRANCHES);
console.log('Total:', ALTUS_VALID_BRANCHES.length); // 65 branches
```

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Invalid branch" error | User entered custom branch name | Validated and mapped or used default |
| Fuzzy match not working | Input doesn't contain branch substring | Falls back to province default |
| No province selected | User skipped step 1 | Defaults to "Head Office" |
| Still getting API error | Branch validation bypassed | Check import and usage of helpers |

### Files Using Branch Validation

- `src/hooks/useUATWorkflow.ts` - Loan request validation
- `src/api/altusApi.ts` - Customer creation validation  
- `src/components/wizard/steps/CustomerStep.tsx` - Form options

### Constants File

**Location:** `src/constants/branchConstants.ts`
- 65 valid ALTUS branches
- Province-to-branch mapping
- Validation functions

### API Integration

All calls to these endpoints now validate branch names:
- `POST /API/LoanRequest/Salaried`
- `POST /API/LoanRequest/Business`
- `POST /API/CustomerServices/RetailCustomer`
- `POST /API/CustomerServices/BusinessCustomer`
