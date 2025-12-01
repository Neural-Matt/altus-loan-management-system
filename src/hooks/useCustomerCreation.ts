/**
 * Customer Creation Workflow Hook
 * Handles the complete customer creation flow including RequestId polling
 * 
 * WORKFLOW:
 * 1. Submit customer creation request
 * 2. Receive RequestId (NOT CustomerID immediately)
 * 3. Poll GetStatus API until RequestStatus = "1" (Approved/Rejected)
 * 4. Once approved, customer is ready for loan request
 */

import { useState, useCallback } from 'react';
import {
  createRetailCustomer,
  createBusinessCustomer,
  getCustomerRequestStatus,
  pollCustomerRequestStatus,
  AltusApiException
} from '../api/altusApi';
import type {
  RetailCustomerRequest,
  BusinessCustomerRequest
} from '../types/altus';

export interface CustomerCreationState {
  status: 'idle' | 'creating' | 'polling' | 'success' | 'error';
  requestId: string | null;
  customerId: string | null;
  requestStatus: string | null; // "0" = Pending, "1" = Approved/Rejected
  error: string | null;
  pollingAttempts: number;
}

export interface UseCustomerCreationReturn {
  state: CustomerCreationState;
  createCustomer: (data: RetailCustomerRequest | BusinessCustomerRequest, isRetail: boolean) => Promise<void>;
  checkStatus: (requestId: string) => Promise<void>;
  reset: () => void;
}

export const useCustomerCreation = (): UseCustomerCreationReturn => {
  const [state, setState] = useState<CustomerCreationState>({
    status: 'idle',
    requestId: null,
    customerId: null,
    requestStatus: null,
    error: null,
    pollingAttempts: 0
  });

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      requestId: null,
      customerId: null,
      requestStatus: null,
      error: null,
      pollingAttempts: 0
    });
  }, []);

  const checkStatus = useCallback(async (requestId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, status: 'polling' }));

      const statusResponse = await getCustomerRequestStatus(requestId);

      setState(prev => ({
        ...prev,
        requestId: statusResponse.RequestId,
        requestStatus: statusResponse.RequestStatus,
        status: statusResponse.RequestStatus === "1" ? 'success' : 'polling',
        pollingAttempts: prev.pollingAttempts + 1
      }));
    } catch (error) {
      const errorMessage = error instanceof AltusApiException
        ? error.message
        : error instanceof Error
        ? error.message
        : 'Failed to check customer request status';

      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));

      throw error;
    }
  }, []);

  const createCustomer = useCallback(async (
    data: RetailCustomerRequest | BusinessCustomerRequest,
    isRetail: boolean
  ) => {
    try {
      // Reset state
      reset();

      // Step 1: Create customer
      setState(prev => ({ ...prev, status: 'creating' }));

      console.log('[Customer Creation] Starting customer creation...');

      const createResponse = isRetail
        ? await createRetailCustomer(data as RetailCustomerRequest)
        : await createBusinessCustomer(data as BusinessCustomerRequest);

      // Extract RequestId from response (handle different response formats)
      const requestId = (createResponse as any).outParams?.RequestId || (createResponse as any).RequestId;

      if (!requestId) {
        throw new Error('No RequestId received from customer creation API');
      }

      console.log('[Customer Creation] Created with RequestId:', requestId);

      setState(prev => ({
        ...prev,
        status: 'polling',
        requestId
      }));

      // Step 2: Poll for approval
      console.log('[Customer Creation] Starting status polling...');

      const finalStatus = await pollCustomerRequestStatus(
        requestId,
        30, // Max 30 attempts
        2000 // Poll every 2 seconds
      );

      console.log('[Customer Creation] Final status:', finalStatus);

      // Step 3: Check if approved
      if (finalStatus.RequestStatus === "1") {
        // Extract CustomerID from final response if available
        const customerId = (finalStatus as any).CustomerID || (createResponse as any).outParams?.CustomerID || null;

        setState({
          status: 'success',
          requestId: finalStatus.RequestId,
          customerId,
          requestStatus: finalStatus.RequestStatus,
          error: null,
          pollingAttempts: 0
        });

        console.log('[Customer Creation] Customer approved:', {
          requestId: finalStatus.RequestId,
          customerId,
          status: finalStatus.RequestStatus
        });
      } else {
        // Still pending or rejected
        setState({
          status: 'error',
          requestId: finalStatus.RequestId,
          customerId: null,
          requestStatus: finalStatus.RequestStatus,
          error: finalStatus.ResponseMessage || 'Customer request was not approved',
          pollingAttempts: 0
        });
      }

    } catch (error) {
      const errorMessage = error instanceof AltusApiException
        ? error.message
        : error instanceof Error
        ? error.message
        : 'Failed to create customer';

      console.error('[Customer Creation] Error:', error);

      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));

      throw error;
    }
  }, [reset]);

  return {
    state,
    createCustomer,
    checkStatus,
    reset
  };
};

/**
 * Simplified customer creation that returns RequestId immediately
 * Use this when you want to handle polling manually
 */
export const useCustomerCreationSimple = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const createCustomer = async (
    data: RetailCustomerRequest | BusinessCustomerRequest,
    isRetail: boolean
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const response = isRetail
        ? await createRetailCustomer(data as RetailCustomerRequest)
        : await createBusinessCustomer(data as BusinessCustomerRequest);

      const reqId = (response as any).outParams?.RequestId || (response as any).RequestId;

      if (!reqId) {
        throw new Error('No RequestId received from customer creation API');
      }

      setRequestId(reqId);
      return reqId;

    } catch (err) {
      const errorMessage = err instanceof AltusApiException
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to create customer';

      setError(errorMessage);
      throw err;

    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setRequestId(null);
  };

  return {
    loading,
    error,
    requestId,
    createCustomer,
    reset
  };
};
