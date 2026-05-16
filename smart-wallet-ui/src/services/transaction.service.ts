import axiosInstance from '../api/axiosConfig';
import type { TransactionResponse, TransferRequest } from '../api/types';

/**
 * Initiate a transfer between wallets
 */
export const initiateTransfer = async (transferRequest: TransferRequest): Promise<TransactionResponse> => {
  const response = await axiosInstance.post('/transactions/transfer', transferRequest);
  return response.data;
};

/**
 * Get the transaction history for the logged-in user
 */
export const getTransactionHistory = async (): Promise<TransactionResponse[]> => {
  const response = await axiosInstance.get('/transactions/my-transactions');
  return response.data;
};

/**
 * Deposit funds into the wallet
 */
export const depositFunds = async (amount: number): Promise<TransactionResponse> => {
  const response = await axiosInstance.post('/transactions/deposit', { amount });
  return response.data;
};

/**
 * Withdraw funds from the wallet
 */
export const withdrawFunds = async (amount: number): Promise<TransactionResponse> => {
  const response = await axiosInstance.post('/transactions/withdraw', { amount });
  return response.data;
};
