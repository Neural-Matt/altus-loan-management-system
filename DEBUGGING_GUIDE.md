# Loan Application Debugging Guide

## Current Issue (Dec 4, 2024)

**Symptom**: Documents not uploading, no ApplicationNumber received, applications not logged on backend

**Error**: `Loan request failed: No ApplicationNumber returned`

## Recent Changes

### ✅ Fixed (Dec 3, 2024)
- **Bank Branch Dropdown**: Updated to match API's 37 accepted values
  - Commit: 637c287
  - File: `src/components/wizard/steps/CustomerStep.tsx`
  - Status: Fixed and deployed

### 🔍 Current Investigation (Dec 4, 2024)
- **Enhanced Error Logging**: Added detailed console logging
  - File: `src/hooks/useUATWorkflow.ts`
  - Build: main.8339b674.js
  - Changes:
    ```typescript
    console.log('📋 Response Status:', loanResult.executionStatus);
    console.log('📋 Response Message:', loanResult.executionMessage);
    console.log('📋 Response outParams:', loanResult.outParams);
    console.error('❌ Error Message:', loanResult.executionMessage);
    ```

## How to Debug

### Step 1: Check Console for Actual Error
After building with enhanced logging, test a loan application and check the browser console for:
- `📋 Response Status:` - Should be "Success" or "Failure"
- `📋 Response Message:` - The actual error message from the API
- `❌ Error Message:` - Will show what validation failed

### Step 2: Common API Validation Errors

Based on UAT documentation, check for these field validations:

#### Required Fields (Salaried Loan Request)
- TypeOfCustomer: "New" or "Existing"
- CustomerName
- IdentityNo (NRC format)
- ContactNo (must be valid)
- EmailId
- DateOfBirth (format: DD/MM/YYYY)
- Gender: "Male" or "Female"
- MaritalStatus
- **FinancialInstitutionBranchName** (must match accepted list)
- AccountNumber
- AccountType: "Savings" or "Current"
- LoanAmount
- Tenure
- EmployerName
- EmploymentType: "1" (Permanent) or "2" (Contract)
- Sector (must match accepted list)
- GrossSalary
- NetSalary
- And more...

#### Format Validations
1. **NRC**: Must be format NNNNNN/NN/N (e.g., "129874/21/8")
2. **Phone**: Must be valid format
3. **Email**: Must be valid email
4. **Date**: Must be DD/MM/YYYY format
5. **Gender**: Exactly "Male" or "Female" (case-sensitive)
6. **Account Type**: Exactly "Savings" or "Current"

#### Field-Specific Issues to Check

**Bank Branch** (Fixed Dec 3):
- Must be one of: Head Office, Commercial Suite, Industrial, Manda Hill, Makeni Mall, Cairo, Kabulonga, Ndola, Jacaranda Mall, Kitwe, Mukuba Mall, Kitwe Industrial, Chingola, Mufulira, Luanshya, Kabwe, Livingstone, Chipata, Choma, Mkushi, Solwezi, Kalumbila, Mazabuka, etc.

**Other Potential Issues**:
- Province names
- District names
- Employment sector
- Customer status
- Relationship types (Next of Kin, Reference)

### Step 3: Inspect Actual Request Payload

Check browser console for:
```
Debug: UAT Salaried Loan Request (Port 5013): Object
```

Expand the object and verify all fields match UAT spec.

### Step 4: Common Fixes

If error message says:
- **"Please Enter Valid..."**: Field has wrong value format or not in allowed list
- **"Please Enter..."**: Required field is missing or empty
- **"Invalid..."**: Value doesn't match validation rules

## API Response Structure

### Success Response
```json
{
  "executionStatus": "Success",
  "executionMessage": "Loan Request has been Processed. Please proceed with Document Upload",
  "instanceId": "6241d0f2-51c6-41fc-8272-af0b74c19330",
  "outParams": {
    "ApplicationNumber": "LRQ20250880000000028"
  },
  "gridParams": null,
  "docParams": null
}
```

### Failure Response
```json
{
  "executionStatus": "Failure",
  "executionMessage": "Please Enter Valid FinancialInstitutionBranch",
  "instanceId": "6241d0f2-51c6-41fc-8272-af0b74c19330",
  "outParams": {
    "ApplicationNumber": null
  },
  "gridParams": null,
  "docParams": null
}
```

## Testing Steps

1. **Clear browser cache and reload**
2. **Fill out loan application form**
3. **Upload documents**
4. **Open browser DevTools Console (F12)**
5. **Look for error messages**:
   - `❌ Error Message:` - Shows what failed
   - `📋 Response Message:` - Shows API validation error
6. **Check the exact field mentioned in error**
7. **Verify dropdown values or input format**
8. **Fix the field and retry**

## Files Modified (Dec 3-4, 2024)

1. `src/components/wizard/steps/CustomerStep.tsx` - Bank branch dropdown fix
2. `src/hooks/useUATWorkflow.ts` - Enhanced error logging
3. Build output: `main.8339b674.js` (217.49 KB gzipped)

## Next Steps

1. ✅ Build with enhanced logging (DONE)
2. ⏳ Deploy to production
3. ⏳ Test loan application
4. ⏳ Check console for actual error message
5. ⏳ Fix the failing validation field
6. ⏳ Rebuild and redeploy
7. ⏳ Verify ApplicationNumber is returned

## Deployment

After each fix:
```bash
npm run build
scp build-fixed.zip root@72.60.187.1:/tmp/
ssh root@72.60.187.1
cd /tmp
unzip -o build-fixed.zip -d /var/www/loan-app/html/
docker exec altus-loan-container nginx -s reload
```

## Reference Documentation

- UAT API Spec: `Docs/UAT - Altus API Details.md`
- Bank Branch Values: Lines 437-473 in `CustomerStep.tsx`
- Validation Constants: `src/constants/validationConstants.ts`
- API Client: `src/api/altusApi.ts`
- Workflow Hook: `src/hooks/useUATWorkflow.ts`

## Contact

For backend API issues, check with Altus backend team regarding:
- Field validation rules
- Accepted value lists (provinces, districts, sectors, etc.)
- ApplicationNumber generation logic
