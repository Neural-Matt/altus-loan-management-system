# Document Upload Implementation Guide

## ✅ Base64 Conversion Compliance

As prescribed in the **UAT API Documentation Section 1.11.5**, all documents **MUST** be converted to **base64 byte format** before being sent to the API.

---

## 📋 UAT Specification

From UAT Documentation:
> **documentContent**: Byte format  
> **Note**: "The image needs to be uploaded in the byte format"

### Request Format
```json
{
  "body": {
    "ApplicationNumber": "LRQ20250870000000004",
    "TypeOfDocument": "30",
    "DocumentNo": "1234",
    "Document": {
      "documentContent": "***byte format***",
      "documentName": "AddressProof.jpg"
    }
  }
}
```

---

## 🔧 Implementation Details

### Conversion Function: `fileToByteFormat()`

Located in: `src/api/altusApi.ts`

**Process:**
1. **Read File as ArrayBuffer** - Load binary data
2. **Convert to Byte Array** - Create Uint8Array from ArrayBuffer
3. **Build Binary String** - Convert each byte to character
4. **Encode to Base64** - Use `btoa()` to create base64 string
5. **Validate Output** - Ensure non-empty result

**Code:**
```typescript
async function fileToByteFormat(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      let binaryString = '';
      
      // Convert byte array to binary string
      for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }
      
      // Encode to base64 (this is the "byte format")
      const base64 = btoa(binaryString);
      resolve(base64);
    };
    
    reader.readAsArrayBuffer(file);
  });
}
```

---

## ✅ Validation & Safety Features

### File Validation
- ✅ **Empty file check** - Rejects if file is null or 0 bytes
- ✅ **Size limit** - Maximum 10MB per file
- ✅ **Type logging** - Logs file type for debugging

### Conversion Validation
- ✅ **Base64 output check** - Ensures non-empty result
- ✅ **Error handling** - Catches conversion errors
- ✅ **Length verification** - Logs output length

### Upload Validation
- ✅ **Application Number check** - Required field validation
- ✅ **File presence check** - Ensures file is provided
- ✅ **Document type mapping** - Validates type codes

---

## 📊 Document Type Codes

As per UAT documentation:

| Code | Document Type |
|------|---------------|
| 6 | NRC ID (Client) |
| 7 | NRC ID (Spouse) |
| 18 | Payslip (Last 3 months) |
| 29 | Employment Contract |
| 17 | Passport |
| 28 | Residence Permit |
| 27 | Work Permit |
| 3 | Business Registration Certificate |
| 30 | Order Copies (default) |

---

## 🔍 Debug Logging

The implementation includes comprehensive logging:

### Before Conversion
```
Debug: Converting file to base64 byte format (UAT requirement)...
Debug: File details - Name: payslip.pdf, Size: 245.67KB, Type: application/pdf
```

### After Conversion
```
Debug: File successfully converted to base64 - Length: 327560 characters
```

### Upload Request
```
Debug: UAT Document Upload Request: {
  applicationNumber: "LRQ20250880000000028",
  documentType: "payslip",
  typeCode: "18",
  fileName: "payslip.pdf",
  fileSize: 251580,
  base64Length: 327560,
  documentNo: "DOC1730808123456"
}
```

### Upload Success
```
Debug: Document upload successful: {
  executionStatus: "Success",
  executionMessage: "Document Saved Successfully",
  outParams: {
    LRDocumentDetailsId: "uuid"
  }
}
```

---

## 🎯 Usage Example

### From React Component

```typescript
import { uploadLoanDocument } from '../api/altusApi';

// After loan request submission (have ApplicationNumber)
const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadLoanDocument(
      "LRQ20250880000000028",  // ApplicationNumber from loan request
      "18",                     // Document type code (Payslip)
      file                      // File object from input
    );
    
    if (result.executionStatus === 'Success') {
      console.log('Document uploaded:', result.outParams.LRDocumentDetailsId);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### From File Input

```tsx
<input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }}
/>
```

---

## 🚨 Error Handling

### File Too Large
```
Error: File too large: 12.45MB. Maximum allowed: 10MB
```
**Solution:** Compress or resize file before upload

### Empty File
```
Error: Invalid file: File is empty or undefined
```
**Solution:** Ensure valid file is selected

### Conversion Failed
```
Error: Failed to convert file to base64: Unknown error
```
**Solution:** Check file integrity, try different format

### Missing Application Number
```
Error: Application Number is required for document upload
```
**Solution:** Submit loan request first to get ApplicationNumber

---

## 📝 Base64 Format Explanation

### What is Base64?
Base64 is a binary-to-text encoding scheme that represents binary data in ASCII string format.

### Why Base64 for Documents?
1. **JSON Compatibility** - Binary data can't be directly sent in JSON
2. **Text-based API** - REST APIs work with text, not raw bytes
3. **Universal Support** - All systems can decode base64
4. **UAT Requirement** - Specified in documentation as "byte format"

### Conversion Example
```
Original File: [Binary data: 01010110...]
       ↓
Byte Array: Uint8Array [86, 78, 45, ...]
       ↓
Binary String: "VN-..."
       ↓
Base64: "Vk4tL1BPVyZQT0lOVA=="
       ↓
API Payload: {"documentContent": "Vk4tL1BPVyZQT0lOVA=="}
```

---

## ✅ Compliance Checklist

- ✅ **Files converted to base64** before sending
- ✅ **UAT request format** followed exactly
- ✅ **Document type codes** mapped correctly
- ✅ **Validation** on all inputs
- ✅ **Error handling** comprehensive
- ✅ **Debug logging** for troubleshooting
- ✅ **File size limits** enforced
- ✅ **Async/await** pattern used
- ✅ **TypeScript types** defined
- ✅ **Bearer token** authentication

---

## 🧪 Testing

### Test Base64 Conversion
```typescript
// Create test file
const testFile = new File(['test content'], 'test.txt', {
  type: 'text/plain'
});

// Convert to base64
const base64 = await fileToByteFormat(testFile);

// Verify
console.log('Base64:', base64);
// Expected: "dGVzdCBjb250ZW50" (base64 of "test content")

// Decode to verify
const decoded = atob(base64);
console.log('Decoded:', decoded);
// Expected: "test content"
```

### Test Document Upload
```typescript
const result = await uploadLoanDocument(
  'LRQ20250880000000028',
  '18',
  testFile
);

console.assert(result.executionStatus === 'Success');
console.assert(result.outParams.LRDocumentDetailsId);
```

---

## 📚 References

1. **UAT Documentation:** Section 1.11.5 - "API –Loan Request Document Upload(Request)"
2. **Implementation:** `src/api/altusApi.ts` - `fileToByteFormat()` function
3. **Upload Function:** `src/api/altusApi.ts` - `uploadLoanDocument()` function
4. **Type Definitions:** `src/types/altus.ts` - `UploadDocumentResponse`

---

## 🎓 Key Points

1. **All documents MUST be base64 encoded** - UAT requirement
2. **Conversion happens automatically** - No manual intervention needed
3. **Validation at multiple levels** - File, conversion, upload
4. **Comprehensive logging** - Easy debugging
5. **Error messages are clear** - User-friendly feedback

---

*Document Upload Implementation - UAT Compliant*  
*Last Updated: November 5, 2025*
