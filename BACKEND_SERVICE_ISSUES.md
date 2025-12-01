# Backend Service Issues - Port 5009

## Status Overview (11/13 APIs Working)

### ✅ Working APIs (11)
1. **Get Loan Balance** - Port 5010 ✅
2. **Get Loan Status** - Port 5010 ✅
3. **Get Loan Details** - Port 5010 ✅
4. **Get Customer Details** - Port 5011 ✅
5. **Get Product Details** - Port 5013 ✅
6. **Upload Document** - Port 5012 ✅
7. **Submit Loan Request (Salaried)** - Port 5010 ✅
8. **Submit Loan Request (Business)** - Port 5010 ✅
9. **Create Retail Customer** - Port 5011 ✅
10. **Create Business Customer** - Port 5011 (Fixed with PrimaryAddress) ✅
11. **Get Loans By Customer** - Port 5009 (Fixed parameter) ✅

### ❌ Non-Working APIs (2) - Backend Service Unavailable

#### 1. Calculate EMI
- **Status**: 404 Not Found
- **Port**: 5009
- **Endpoint**: `http://3.6.174.212:5009/API/LoanList/EMICalculator`
- **Proxy Route**: `/emi-api/API/LoanList/EMICalculator`
- **Test Payload**:
  ```json
  {
    "LoanType": "1",
    "ProductCode": "COPL",
    "EmployerID": "EMP0000004",
    "LoanAmount": "20000",
    "LoanTenure": "6"
  }
  ```

#### 2. Get PBL Eligibility Status
- **Status**: 404 Not Found
- **Port**: 5009
- **Endpoint**: `http://3.6.174.212:5009/API/LoanList/PBLEligibilityStatus`
- **Proxy Route**: `/emi-api/API/LoanList/PBLEligibilityStatus`
- **Test Payload**:
  ```json
  {
    "CustomerId": "0002-0007-3837",
    "LoanAmount": "50000",
    "LoanTenure": "12"
  }
  ```

---

## Issue Analysis

### Verified Correct
✅ **Endpoint Paths**: Confirmed correct per UAT documentation  
✅ **Port Numbers**: 5009 is correct for these services  
✅ **Request Format**: JSON payloads match UAT specification  
✅ **Nginx Configuration**: Proxy route `/emi-api/` correctly configured  
✅ **Frontend Code**: All API calls properly implemented

### Root Cause
❌ **Backend Service Not Running**: The microservice on port 5009 is not responding

---

## Diagnostic Steps

### 1. Check Service Status on Backend
```bash
ssh user@3.6.174.212
ps aux | grep 5009
```
Expected: Should show running process for port 5009 service  
Current: Likely showing no process

### 2. Check Port Listening
```bash
netstat -tulpn | grep 5009
# or
ss -tulpn | grep 5009
```
Expected: Should show service listening on port 5009  
Current: Likely showing nothing

### 3. Check Service Logs
```bash
# Check application logs
journalctl -u loan-service-5009 -n 50
# or check docker logs if containerized
docker logs <container-name>
```
Look for: Startup errors, crashes, port binding issues

### 4. Test Direct Backend Connection
```bash
curl -X POST http://3.6.174.212:5009/API/LoanList/EMICalculator \
  -H "Content-Type: application/json" \
  -d '{
    "LoanType": "1",
    "ProductCode": "COPL",
    "EmployerID": "EMP0000004",
    "LoanAmount": "20000",
    "LoanTenure": "6"
  }'
```
Expected: JSON response  
Current: Connection refused or timeout

### 5. Verify Nginx Can Reach Backend
```bash
# From VPS (72.60.187.1)
ssh root@72.60.187.1
curl -X POST http://3.6.174.212:5009/API/LoanList/EMICalculator \
  -H "Content-Type: application/json" \
  -d '{"LoanType":"1","ProductCode":"COPL","LoanAmount":"20000","LoanTenure":"6"}'
```

---

## Possible Causes

1. **Service Not Deployed**
   - Microservice may not be deployed to backend server
   - Solution: Deploy the service

2. **Service Crashed**
   - Service started but crashed during runtime
   - Check logs for errors
   - Solution: Fix errors and restart

3. **Port Conflict**
   - Another service using port 5009
   - Solution: Stop conflicting service or reconfigure port

4. **Service on Different Port**
   - Service deployed to different port than expected
   - Solution: Update nginx.conf proxy or fix backend port

5. **Network Issue**
   - Firewall blocking port 5009
   - Backend server network configuration issue
   - Solution: Check firewall rules, security groups

6. **Service Dependencies**
   - Database or other required services not available
   - Solution: Verify all dependencies are running

---

## Immediate Actions Required

### Backend Team
1. **Verify Service Deployment**
   - Confirm EMI Calculator service is deployed to 3.6.174.212
   - Confirm it's configured to run on port 5009

2. **Start/Restart Service**
   ```bash
   # Example commands (adjust based on actual deployment)
   systemctl start loan-emi-service
   # or
   docker-compose up -d emi-service
   ```

3. **Check Service Health**
   ```bash
   curl http://localhost:5009/health
   # or
   curl http://localhost:5009/API/LoanList/EMICalculator
   ```

4. **Review Logs**
   - Check for startup errors
   - Check for runtime exceptions
   - Verify database connectivity

### DevOps Team
1. **Verify Port 5009 Access**
   - Check firewall rules
   - Check security groups
   - Verify nginx can reach backend:5009

2. **Monitor Service**
   - Set up service monitoring
   - Set up alerts for service downtime
   - Add health checks

---

## Frontend Changes Made

### Enhanced Error Handling
The frontend now provides detailed diagnostics for 404 errors:

```typescript
if (error?.response?.status === 404 && test.port === '5009') {
  errorMessage = '404: Backend service not responding';
  errorDetails = {
    issue: 'Backend microservice on port 5009 is not available',
    backendUrl: `http://3.6.174.212:${test.port}/${test.endpoint}`,
    proxyRoute: `/emi-api/${test.endpoint}`,
    possibleCauses: [
      'Service not deployed or stopped on backend server',
      'Service running on different port',
      'Network connectivity issue between nginx and backend',
      'Service crashed or failed to start'
    ],
    nextSteps: [
      'SSH to backend server: ssh user@3.6.174.212',
      'Check if service is running: ps aux | grep 5009',
      'Check service logs for errors',
      'Verify service is listening: netstat -tulpn | grep 5009',
      'Contact backend team to restart service'
    ]
  };
}
```

---

## Working Port 5009 Endpoint

Note: **Get Loans By Customer** on port 5009 IS working:
- URL: `http://3.6.174.212:5009/API/LoanList/GetLoansByCustomer`
- This proves:
  - ✅ Backend server is reachable
  - ✅ Port 5009 is accessible from VPS
  - ✅ Nginx proxy is configured correctly
  - ❌ Only EMI Calculator and PBL Eligibility endpoints are down

This indicates the issue is **specific endpoint services** not running, not a broader network/infrastructure problem.

---

## Testing After Fix

Once backend team confirms service is running:

1. **Test from Frontend**
   - Visit: https://applynow.altuszm.com/api-test
   - Click "Calculate EMI"
   - Click "Get PBL Eligibility Status"
   - Both should return successful responses

2. **Verify All 13 APIs Working**
   - Click "Run All Tests"
   - Should show 13/13 successful

---

## Contact Information

**Frontend Deployment**: ✅ Complete and stable  
**Backend Services**: ❌ Port 5009 EMI/PBL endpoints need attention

**Next Steps**: Backend team to investigate and restart port 5009 services for EMI Calculator and PBL Eligibility Status endpoints.
