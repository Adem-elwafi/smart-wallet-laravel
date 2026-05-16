import axiosInstance from '../api/axiosConfig';

export const getMyWallet = async () => {
  const response = await axiosInstance.get('/wallets/my-wallet');
  return response.data;
};
