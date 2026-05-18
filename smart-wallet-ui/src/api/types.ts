export interface AuthResponse {
    token: string;
    username: string;
    email?: string;
}

export interface WalletResponse {
    accountNumber: string;
    balance: number;
    currency: string;
}

export interface Transaction {
    id: number;
    amount: number;
    timestamp: string;
    type: 'DEBIT' | 'CREDIT';
    description: string;
    senderAccountNumber: string;
    recipientAccountNumber: string;
}

export interface TransferRequest {
    receiverWalletNumber: string;
    amount: number;
    description: string;
}

export interface TransactionResponse {
    id: number;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
    senderWalletId: number | null;
    receiverWalletId: number | null;
    senderAccountNumber?: string | null;
    recipientAccountNumber?: string | null;
    senderFirstname?: string | null;
    senderLastname?: string | null;
    recipientFirstname?: string | null;
    recipientLastname?: string | null;
}

export interface ApiError {
    message: string;
}

export interface Profile {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    image?: string | null;
}

export interface UpdateProfileRequest {
    email: string;
    fullName?: string;
    avatarUrl?: string;
}