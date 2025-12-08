# ALTUS Production API - Valid Branches (FINAL)

## 🎯 Complete List of Valid Branches

Based on actual ALTUS Production API error messages received on **December 3, 2025**.

**Total: 29 branches** confirmed by real API responses.

---

## ✅ All Valid Branches (Alphabetical)

1. Bread of Life
2. Chililabombwe
3. Chingola
4. Chipata
5. Garden
6. Head Office
7. Kalingalinga
8. Kasama
9. Kitwe
10. Kitwe Agency
11. Longacres Prestige Branch
12. Lusaka Corporate Service Centre Branch
13. Lusaka South End
14. Lusaka Square
15. Makumbi
16. Manda Hill Branch
17. Mansa
18. Mansa Branch
19. Matero Branch
20. Mbala
21. Mbala Branch Zambia
22. Mkushi Branch
23. Mpulungu
24. Mufumbwe
25. Mwense
26. Ndola
27. Petauke Branch
28. Solwezi
29. Tazara

---

## 📍 Branches by Province

### Lusaka Province (12 branches)
**Head Office & Corporate:**
- Head Office
- Lusaka Corporate Service Centre Branch

**Retail Branches:**
- Lusaka Square
- Lusaka South End
- Kalingalinga
- Tazara
- Garden
- Makumbi
- Bread of Life
- Longacres Prestige Branch
- Manda Hill Branch
- Matero Branch

### Copperbelt Province (5 branches)
- Ndola
- Kitwe
- Kitwe Agency
- Chililabombwe
- Chingola

### Northern Province (4 branches)
- Kasama
- Mpulungu
- Mbala
- Mbala Branch Zambia

### Luapula Province (3 branches)
- Mansa
- Mansa Branch
- Mwense

### Eastern Province (2 branches)
- Chipata
- Petauke Branch

### North-Western Province (2 branches)
- Solwezi
- Mufumbwe

### Central Province (1 branch)
- Mkushi Branch

---

## 🔍 How This List Was Compiled

1. **First API Error (21 branches):**
   ```
   Please enter Valid FinancialInstitutionBranch - Head Office, Lusaka Square,
   Lusaka South End, Kalingalinga, Tazara, Garden, Makumbi, Bread of Life, Ndola,
   Kitwe, Kitwe Agency, Chililabombwe, Chingola, Kasama, Chipata, Mpulungu, Mbala,
   Mansa, Solwezi, Mufumbwe, Mwense
   ```

2. **Second API Error (8 additional branches):**
   ```
   Please enter Valid FinancialInstitutionBranch - Petauke Branch, Manda Hill Branch,
   Matero Branch, Mkushi Branch, Mbala Branch Zambia, Longacres Prestige Branch,
   Lusaka Corporate Service Centre Branch, Mansa Branch
   ```

3. **Result:** 29 unique branches total (some duplicates like "Mansa" and "Mansa Branch")

---

## 📊 Implementation Status

✅ **Complete** - All 29 branches added to `src/constants/bankBranches.ts`  
✅ **Complete** - Geographic grouping configured  
✅ **Complete** - Autocomplete dropdowns in CustomerStep.tsx  
✅ **Complete** - Validation guard in useUATWorkflow.ts

---

## ⚠️ Important Notes

1. **These are the ONLY branches accepted** by ALTUS Production API
2. **Do NOT add branches** unless confirmed by an actual API error message
3. **UAT branches** (like "Commercial Suite", "Electronic Banking", etc.) are **NOT valid** in production
4. Some branches have "Branch" suffix (e.g., "Manda Hill Branch", "Petauke Branch")
5. "Mansa" and "Mansa Branch" are both valid (separate entries)
6. "Mbala" and "Mbala Branch Zambia" are both valid (separate entries)

---

## 🧪 Testing Status

❌ **API Testing Failed** - ALTUS Production API timed out during systematic testing  
✅ **Error Message Analysis Complete** - All branches extracted from real API responses  
✅ **Manual Verification** - Tested via actual loan application submissions

---

**Last Updated:** December 3, 2025  
**Source:** ALTUS Production API (http://41.72.214.12:5013)  
**Method:** Actual error message analysis from failed loan submissions
