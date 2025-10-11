import React, { useEffect, useState } from 'react';
import { useAltus } from '../context';
import type { RetailCustomerRequest } from '../types/altus';

// ============================================================================
// EXAMPLE COMPONENT USING ALTUS CONTEXT
// ============================================================================

const AltusContextExample: React.FC = () => {
  const {
    state,
    fetchCustomerByNRC,
    createRetailCustomer,
    fetchLoanDetails,
    fetchLoanBalance,
    submitLoanRequest,
    uploadLoanDocument,
    clearErrors,
    clearSuccessFlags,
    isLoading,
    hasError,
    getError
  } = useAltus();

  const [nrcInput, setNrcInput] = useState('');
  const [loanIdInput, setLoanIdInput] = useState('');

  // ============================================================================
  // CUSTOMER OPERATIONS EXAMPLE
  // ============================================================================

  const handleFetchCustomer = async () => {
    if (!nrcInput.trim()) {
      alert('Please enter an NRC number');
      return;
    }

    const customer = await fetchCustomerByNRC(nrcInput.trim());
    
    if (customer) {
      console.log('Customer fetched successfully:', customer);
    } else if (hasError('customer')) {
      const error = getError('customer');
      console.error('Customer fetch failed:', error?.message);
    }
  };

  const handleCreateCustomer = async () => {
    const customerData: RetailCustomerRequest = {
      firstName: "John",
      lastName: "Banda",
      nrc: "123456/78/9",
      phoneNumber: "+260977123456",
      emailAddress: "john.banda@email.com",
      dateOfBirth: "1990-01-15",
      gender: "Male",
      nationality: "Zambian",
      maritalStatus: "Single",
      address: {
        street: "123 Main Street",
        city: "Lusaka",
        province: "Lusaka",
        country: "Zambia"
      },
      employment: {
        employerId: "EMP001",
        employerName: "Test Employer",
        employerCode: "TEST",
        position: "Software Developer",
        salary: 15000,
        employmentDate: "2020-01-01",
        employmentType: "Permanent"
      },
      nextOfKin: {
        firstName: "Jane",
        lastName: "Banda",
        relationship: "Sister",
        phoneNumber: "+260977654321"
      }
    };

    const customer = await createRetailCustomer(customerData);
    
    if (customer) {
      console.log('Customer created successfully:', customer);
    }
  };

  // ============================================================================
  // LOAN OPERATIONS EXAMPLE
  // ============================================================================

  const handleFetchLoanDetails = async () => {
    if (!loanIdInput.trim()) {
      alert('Please enter a Loan ID');
      return;
    }

    const loan = await fetchLoanDetails(loanIdInput.trim());
    
    if (loan) {
      console.log('Loan details fetched successfully:', loan);
      
      // Also fetch balance for this loan
      await fetchLoanBalance(loan.loanId);
    }
  };

  const handleSubmitLoanRequest = async () => {
    if (!state.currentCustomer) {
      alert('Please fetch or create a customer first');
      return;
    }

    const loanRequestData = {
      customerId: state.currentCustomer.customerId,
      productCode: "PAYROLL001",
      amount: 50000,
      tenureMonths: 24,
      purpose: "Personal loan",
      currency: "ZMW"
    };

    const request = await submitLoanRequest(loanRequestData);
    
    if (request) {
      console.log('Loan request submitted successfully:', request);
    }
  };

  // ============================================================================
  // DOCUMENT UPLOAD EXAMPLE
  // ============================================================================

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', 'PAYSLIP');
    formData.append('applicationId', state.loanRequest?.applicationId || '');

    const result = await uploadLoanDocument(formData);
    
    if (result) {
      console.log('Document uploaded successfully:', result);
    }
  };

  // ============================================================================
  // EFFECT FOR SUCCESS FLAGS
  // ============================================================================

  useEffect(() => {
    if (state.successFlags.customerCreated) {
      alert('Customer created successfully!');
      clearSuccessFlags();
    }
  }, [state.successFlags.customerCreated, clearSuccessFlags]);

  useEffect(() => {
    if (state.successFlags.loanRequestSubmitted) {
      alert(`Loan request submitted! Reference: ${state.loanRequest?.referenceNumber}`);
      clearSuccessFlags();
    }
  }, [state.successFlags.loanRequestSubmitted, state.loanRequest?.referenceNumber, clearSuccessFlags]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Altus Context Example</h1>
      
      {/* Global Loading Indicator */}
      {isLoading() && (
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          color: '#1976d2'
        }}>
          Loading... (Operation in progress)
        </div>
      )}

      {/* Global Error Display */}
      {hasError() && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          color: '#d32f2f'
        }}>
          <strong>Error:</strong> {Object.values(state.errors).find(e => e)?.message}
          <button 
            onClick={clearErrors}
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            Clear Errors
          </button>
        </div>
      )}

      {/* Customer Operations */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Customer Operations</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Enter NRC (e.g., 123456/78/9)"
            value={nrcInput}
            onChange={(e) => setNrcInput(e.target.value)}
            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
          />
          <button 
            onClick={handleFetchCustomer}
            disabled={isLoading('fetchingCustomer')}
            style={{ padding: '8px 15px', marginRight: '10px' }}
          >
            {isLoading('fetchingCustomer') ? 'Fetching...' : 'Fetch Customer'}
          </button>
          <button 
            onClick={handleCreateCustomer}
            disabled={isLoading('creatingCustomer')}
            style={{ padding: '8px 15px' }}
          >
            {isLoading('creatingCustomer') ? 'Creating...' : 'Create Test Customer'}
          </button>
        </div>

        {state.currentCustomer && (
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <h3>Current Customer:</h3>
            <p><strong>Name:</strong> {state.currentCustomer.firstName} {state.currentCustomer.lastName}</p>
            <p><strong>NRC:</strong> {state.currentCustomer.nrc}</p>
            <p><strong>Phone:</strong> {state.currentCustomer.phoneNumber}</p>
            <p><strong>Nationality:</strong> {state.currentCustomer.nationality}</p>
            {state.currentCustomer.employment && (
              <p><strong>Employer:</strong> {state.currentCustomer.employment.employerName}</p>
            )}
          </div>
        )}
      </section>

      {/* Loan Operations */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Loan Operations</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Enter Loan ID"
            value={loanIdInput}
            onChange={(e) => setLoanIdInput(e.target.value)}
            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
          />
          <button 
            onClick={handleFetchLoanDetails}
            disabled={isLoading('fetchingLoanDetails')}
            style={{ padding: '8px 15px', marginRight: '10px' }}
          >
            {isLoading('fetchingLoanDetails') ? 'Fetching...' : 'Fetch Loan Details'}
          </button>
          <button 
            onClick={handleSubmitLoanRequest}
            disabled={isLoading('submittingLoanRequest') || !state.currentCustomer}
            style={{ padding: '8px 15px' }}
          >
            {isLoading('submittingLoanRequest') ? 'Submitting...' : 'Submit Loan Request'}
          </button>
        </div>

        {state.currentLoan && (
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <h3>Current Loan:</h3>
            <p><strong>Loan ID:</strong> {state.currentLoan.loanId}</p>
            <p><strong>Product:</strong> {state.currentLoan.productName || state.currentLoan.productCode}</p>
            <p><strong>Amount:</strong> {state.currentLoan.currency} {state.currentLoan.loanAmount?.toLocaleString()}</p>
            <p><strong>Status:</strong> {state.currentLoan.status}</p>
            <p><strong>Tenure:</strong> {state.currentLoan.tenureMonths} months</p>
          </div>
        )}

        {state.loanBalance && (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <h3>Loan Balance:</h3>
            <p><strong>Principal:</strong> {state.loanBalance.currency} {state.loanBalance.principalBalance?.toLocaleString()}</p>
            <p><strong>Interest:</strong> {state.loanBalance.currency} {state.loanBalance.interestBalance?.toLocaleString()}</p>
            <p><strong>Total:</strong> {state.loanBalance.currency} {state.loanBalance.totalBalance?.toLocaleString()}</p>
            {state.loanBalance.nextPaymentDate && (
              <p><strong>Next Payment:</strong> {state.loanBalance.currency} {state.loanBalance.nextPaymentAmount?.toLocaleString()} on {state.loanBalance.nextPaymentDate}</p>
            )}
          </div>
        )}

        {state.loanRequest && (
          <div style={{ 
            backgroundColor: '#fff3e0', 
            padding: '15px', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <h3>Loan Request:</h3>
            <p><strong>Application ID:</strong> {state.loanRequest.applicationId}</p>
            <p><strong>Reference:</strong> {state.loanRequest.referenceNumber}</p>
            <p><strong>Status:</strong> {state.loanRequest.status}</p>
            <p><strong>Amount:</strong> {state.loanRequest.currency} {state.loanRequest.requestedAmount?.toLocaleString()}</p>
            <p><strong>Applied:</strong> {new Date(state.loanRequest.applicationDate).toLocaleDateString()}</p>
          </div>
        )}
      </section>

      {/* Document Upload */}
      <section style={{ marginBottom: '30px' }}>
        <h2>Document Upload</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={isLoading('uploadingDocument')}
          style={{ padding: '8px' }}
        />
        {isLoading('uploadingDocument') && <span style={{ marginLeft: '10px' }}>Uploading...</span>}
      </section>

      {/* Recent Loans */}
      {state.recentLoans.length > 0 && (
        <section>
          <h2>Recent Loans</h2>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {state.recentLoans.map((loan, index) => (
              <div key={loan.loanId} style={{ 
                backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                padding: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <strong>{loan.loanId}</strong> - {loan.currency} {loan.loanAmount?.toLocaleString()} - {loan.status}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AltusContextExample;