# ALTUS API Branch Validation Integration Summary

## 🎯 Problem Solved

**Error:** `"Please enter Valid FinancialInstitutionBranch - Head Office, International Bank, ..."`

**Root Cause:** Loan requests were sending invalid or unmapped bank branch names to ALTUS API

**Impact:** Users unable to complete loan application workflow

---

## ✅ Solution Components

### 1️⃣ Branch Constants Module
**File:** `src/constants/branchConstants.ts`

```
┌─────────────────────────────────────────┐
│      ALTUS_VALID_BRANCHES (65)          │
│  - Head Office                          │
│  - Lusaka Business Centre               │
│  - Ndola Business Centre                │
│  - ... 62 more ...                      │
└─────────────────────────────────────────┘
         ↓
    Validation Functions:
    • isValidBranchName()        → true/false
    • getBranchByPartialMatch()  → matched name
    • getDefaultBranchForProvince() → province default
```

### 2️⃣ Smart Branch Resolution
```
User Input (from form)
    ↓
┌─────────────────────────────────┐
│ Step 1: Is it valid?            │
│ isValidBranchName(input)        │
│ YES → Use directly              │
│ NO → Continue to Step 2         │
└─────────────────────────────────┘
    ↓ NO
┌─────────────────────────────────┐
│ Step 2: Can we fuzzy-match?     │
│ getBranchByPartialMatch(input)  │
│ YES → Use matched branch        │
│ NO → Continue to Step 3         │
└─────────────────────────────────┘
    ↓ NO
┌─────────────────────────────────┐
│ Step 3: Use province default    │
│ getDefaultBranchForProvince()   │
│ Returns province branch OR      │
│ "Head Office" as fallback       │
└─────────────────────────────────┘
    ↓
  API ✓ Accepts Request
```

### 3️⃣ Integration Points

```
Workflow Step 1 (Customer Info)
  └─→ CustomerStep.tsx
      └─→ Updated dropdown with 65 valid branches
      
Workflow Step 3 (Documents)
  └─→ DocumentsStep.tsx
      └─→ Calls useUATWorkflow.ts
          └─→ submitLoanApplication()
              └─→ useUATWorkflow.ts
                  └─→ Branch validation applied
                      └─→ altusApi.submitLoanRequest()
                          └─→ API receives valid branch ✓
```

### 4️⃣ Files Modified

| File | Change | Impact |
|------|--------|--------|
| `src/constants/branchConstants.ts` | **NEW** | Centralized branch validation |
| `src/hooks/useUATWorkflow.ts` | **UPDATED** | Import & apply branch validation |
| `src/api/altusApi.ts` | **UPDATED** | Import & validate in createRetailCustomer |
| `src/components/wizard/steps/CustomerStep.tsx` | **UPDATED** | Use valid branch options in dropdown |

---

## 🧪 Test Scenarios

### Scenario 1: User Selects Valid Branch
```
Input: "Lusaka Business Centre"
      ↓
isValidBranchName() → true
      ↓
API Receives: "Lusaka Business Centre" ✓
Result: SUCCESS
```

### Scenario 2: User Enters Partial Name
```
Input: "ndola"
      ↓
isValidBranchName() → false
getBranchByPartialMatch("ndola") → "Ndola Business Centre"
      ↓
API Receives: "Ndola Business Centre" ✓
Result: SUCCESS
```

### Scenario 3: User Leaves Field Empty
```
Input: ""
      ↓
isValidBranchName() → false
getBranchByPartialMatch() → null
getDefaultBranchForProvince("Lusaka") → "Lusaka Business Centre"
      ↓
API Receives: "Lusaka Business Centre" ✓
Result: SUCCESS
```

### Scenario 4: Invalid Custom Input
```
Input: "My Random Branch"
      ↓
isValidBranchName() → false
getBranchByPartialMatch() → null
getDefaultBranchForProvince(province) → Mapped branch
      ↓
API Receives: Valid branch (by default) ✓
Result: SUCCESS
```

---

## 📊 Branch Directory

### By Region

**Lusaka (9 core + 8 suburbs = 17)**
- Head Office
- International Bank
- Lusaka Business Centre
- Lusaka Northend
- Woodlands
- Avondale
- Waterfalls
- [+ 11 more]

**Copperbelt (11)**
- Ndola Business Centre
- Kitwe Clearing Centre
- Chingola
- Mufulira
- [+ 7 more]

**Northern (5)**
- Kasama
- Mansa
- Mpika
- Chinsali
- Kawambwa

**Central (4)**
- Kabwe
- Mkushi
- Kapiri Mposhi
- Chisamba

**Eastern (5)**
- Chipata
- Choma
- Nakonde
- Lundazi
- Petauke

**Southern (8)**
- Livingstone
- Mazabuka
- Monze
- Maamba
- Namwala
- Siavonga
- Senanga
- [+ 1 more]

**Western (3)**
- Mongu
- Solwezi
- City Market

**Other (3)**
- Kafue
- Chirundu
- Itezhi Tezhi
- Mfuwe

**Total: 65 branches**

---

## 🔄 API Endpoints Protected

### Customer Services
- ✅ `POST /API/CustomerServices/RetailCustomer`
- ✅ `POST /API/CustomerServices/BusinessCustomer`

### Loan Request Services
- ✅ `POST /API/LoanRequest/Salaried`
- ✅ `POST /API/LoanRequest/Business`

---

## 🚀 Deployment Impact

### Before Fix
```
❌ User enters branch
❌ No validation
❌ API rejects invalid branch
❌ User sees cryptic error
❌ Workflow stuck
```

### After Fix
```
✅ User enters branch
✅ Auto-validated/mapped
✅ API accepts request
✅ User completes workflow
✅ Application submitted
```

---

## 📖 Developer Notes

### Import Examples
```typescript
// Basic validation
import { isValidBranchName } from '../constants/branchConstants';

// Full suite
import { 
  ALTUS_VALID_BRANCHES,
  getDefaultBranchForProvince,
  isValidBranchName,
  getBranchByPartialMatch 
} from '../constants/branchConstants';
```

### Usage Examples
```typescript
// Validate
const valid = isValidBranchName("Lusaka Business Centre"); // true

// Get default
const branch = getDefaultBranchForProvince("Lusaka"); // "Lusaka Business Centre"

// List all
ALTUS_VALID_BRANCHES.length; // 65

// Fuzzy match
const matched = getBranchByPartialMatch("ndola"); // "Ndola Business Centre"
```

---

## ✨ Benefits

| Benefit | Description |
|---------|-------------|
| **User Experience** | No more cryptic validation errors |
| **Data Quality** | All API requests use valid branch names |
| **Resilience** | Fallback to defaults if input unclear |
| **Maintainability** | Centralized branch list (single source of truth) |
| **Future-Proof** | Easy to sync with API if branches change |
| **Testing** | Predictable validation logic |

---

## 📝 Validation Rules

### For FinancialInstitutionBranchName field:
1. **Must be** one of 65 predefined branches
2. **Case-sensitive** (exact match required)
3. **No spaces** allowed at start/end (trimmed before validation)
4. **Cannot be** empty (must default or map)

---

## 🔐 Error Prevention

The app now prevents these errors:
```
❌ "Please enter Valid FinancialInstitutionBranch - [full list]"
❌ API validation failure
❌ Loan request rejection
```

Instead provides:
```
✅ Smart branch mapping
✅ Automatic validation
✅ Seamless workflow completion
```

---

## 📞 Support

For questions about branch validation:
1. Check `BRANCH_VALIDATION_GUIDE.md` for usage examples
2. Review `src/constants/branchConstants.ts` for function docs
3. Check git logs for integration history
