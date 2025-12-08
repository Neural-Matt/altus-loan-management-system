# Branch Validation Debug Guide

## Problem
You were seeing loan requests fail with: "Please enter Valid FinancialInstitutionBranchName" errors that listed OLD invalid branches like "Commercial Suite", "Industrial", "Electronic Banking", etc.

## Solution Implemented
We've added comprehensive branch validation with logging throughout the system:

1. **branchConstants.ts** - Single source of truth for 65 valid ALTUS branches
2. **useUATWorkflow.ts** - 3-level validation during loan submission (workflow layer)
3. **altusApi.ts** - Validation check before sending to API (API layer)
4. **CustomerStep.tsx** - Dropdown now only shows 65 valid branches (UI layer)

## How to Verify the Fix

### Step 1: Clear Your Browser Cache
This ensures you're running the latest code, not cached old code.

**Chrome/Chromium:**
1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. Select "All time" for time range
3. Check: Cookies and other site data, Cached images and files
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
2. Click "Clear Now"

**Safari:**
1. Click "Safari" → "Preferences"
2. Go to "Privacy" tab
3. Click "Remove All Website Data"

### Step 2: Close DevTools and Reload

1. Close all browser windows with the application
2. Reopen browser and navigate to the application
3. Open DevTools: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
4. Go to Console tab

### Step 3: Fill Out the Form

1. **Go to Customer Details (Step 1)**
2. **Check the Bank Branch dropdown** - You should see ONLY valid branches like:
   - Head Office
   - Lusaka Business Centre
   - Ndola Business Centre
   - Kitwe Clearing Centre
   - Cairo Business Centre
   - And 60 others
   
   ⚠️ You should NOT see any of these OLD invalid branches:
   - Commercial Suite
   - Industrial
   - FNB Operation Centre
   - Electronic Banking
   - Treasury
   - Manda Hill (if showing as old)
   - Makeni Mall
   - Jacaranda Mall

3. **Select any branch from the dropdown** (they're all valid now)
4. Fill in other required fields

### Step 4: Submit Loan & Check Console Logs

1. **Navigate to Document Upload (Step 3)**
2. **Upload a document**
3. **Click "Submit"**
4. **Immediately check Console** (F12 → Console tab)

### Step 5: Look for These Specific Log Messages

When you submit, you should see logs in this order:

#### Log Type 1: Branch Validation in Workflow (useUATWorkflow.ts)
```
🔍 Bank Branch Validation: {
  providedBranch: "Lusaka Business Centre",
  isValid: true
}
```

**Expected result:** `isValid: true` ✅

**If false:** Your branch wasn't recognized, but it should have been automatically corrected to a valid one via the fallback.

#### Log Type 2: Branch Resolution Result
You should see ONE of these:
```
✅ Using provided branch: "Lusaka Business Centre"
```
OR
```
📍 Mapped "your-typed-text" to valid branch: "Lusaka Business Centre"
```
OR
```
📍 Using default branch for province "Lusaka": "Lusaka Business Centre"
```

#### Log Type 3: API Layer Validation (altusApi.ts)
```
🔐 API Layer Branch Validation: {
  branchName: "Lusaka Business Centre",
  isValid: true,
  allValidBranches: [...]
}
```

**Expected result:** `isValid: true` ✅

#### Log Type 4: Complete Request Object
```
Debug: UAT Salaried Loan Request (Port 5013): {
  typeOfCustomer: "Existing",
  customerId: "your-customer-id",
  includesPersonalDetails: false,
  branchName: "Lusaka Business Centre",
  isValidBranch: true
}
```

### Step 6: Check API Response

After submission, you should see:
```
Debug: Loan Request Response: {
  statusCode: 200,
  statusMessage: "Success",
  data: { applicationNumber: "..." }
}
```

**NOT:**
```
❌ Loan request failed: Please enter Valid FinancialInstitutionBranchName
```

## If Still Seeing Errors

### Scenario A: Dropdown Still Shows OLD Branches
**Solution:** Hardclear cache more aggressively
```bash
# Chrome: Go to chrome://settings/clearBrowserData
# Use full page reload: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
```

### Scenario B: Console Shows `isValid: false` 
This means the selected branch wasn't in the dropdown. 
- Verify you selected from the dropdown (not typed manually)
- Check the exact spelling in console matches our list

### Scenario C: Still Getting API Error
The API backend might not have been updated with new branch list.
- Check backend logs for the exact error
- Verify backend is using the same 65 branches

### Scenario D: No Console Logs Appearing
The code might not have reloaded.
1. Go to DevTools → Sources tab
2. Search for "useUATWorkflow.ts"
3. Look for line with `console.log('🔍 Bank Branch Validation'`
4. If not found, cache isn't cleared properly
5. Repeat Step 1 (Clear Cache) more thoroughly

## Valid ALTUS Branches (Reference)

**Lusaka Region (20 branches):**
Head Office, International Bank, Lusaka Business Centre, Head Office Processing Centre, Cairo Business Centre, Lusaka Northend, Government Business Centre, Lusaka Centre, Lusaka Kwacha, Debt Recovery, Lusaka Premium House, Lusaka Civic Centre, Twin Palms Mall, Northmead, Manda Hill, Xapit, Government Complex, Woodlands, Acacia Park, Digital, Waterfalls

**Copperbelt Region (6 branches):**
Ndola Business Centre, Ndola West, Ndola Industrial, Kitwe Clearing Centre, Kitwe Obote, Kitwe Industrial

**Other Provinces (39 branches):**
Mukuba, Chingola, Mufulira, Luanshya, Kasama, Kabwe, Livingstone, Chipata, Choma, Nakonde, Chinsali, Mpika, Mansa, Kawambwa, Mkushi, Kapiri Mposhi, Namwala, Mfuwe, Siavonga, Mongu, Avondale, Kafue, Chirundu, Mazabuka, Monze, Maamba, Lundazi, Petauke, Chisamba, Itezhi Tezhi, Senanga, Solwezi, City Market, Longacres, Livingstone, Kazungula, Kalomo, Katima Mulilo, Mulongwe

**Total: 65 Valid Branches**

## Still Having Issues?

1. Open DevTools Console
2. Paste this command to check if validation functions work:
```javascript
// Check if branch exists
console.log('Is "Lusaka Business Centre" valid?', isValidBranchName("Lusaka Business Centre"));
```

3. Check the Network tab to see actual API request/response
4. Look for "FinancialInstitutionBranchName" field in the request body
5. Compare with error message from API to see what it received

## Next Steps After Fix

Once loans are submitting successfully:
1. Check Confirmation page shows: "Application submitted." + "Application ID: {id}" + "Initial Status: Under Review"
2. Click "Submit & Track Application" to verify tracking works
3. Test with multiple different valid branches to ensure flexibility
