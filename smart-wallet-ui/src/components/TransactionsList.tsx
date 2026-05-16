import React, { useEffect, useState } from 'react';
import { Receipt, AlertCircle } from 'lucide-react';
import type { TransactionResponse } from '../api/types';
import { getTransactionHistory } from '../services/transaction.service';

interface TransactionsListProps {
  transactions?: TransactionResponse[];
  autoLoad?: boolean;
  onLoad?: (transactions: TransactionResponse[]) => void;
  currentAccountNumber?: string;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ 
  transactions: initialTransactions = [],
  autoLoad = false,
  onLoad,
  currentAccountNumber
}) => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoLoad && transactions.length === 0) {
      loadTransactions();
    }
  }, [autoLoad]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransactionHistory();
      setTransactions(data);
      onLoad?.(data);
    } catch (err) {
      setError('Impossible de charger l\'historique des transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTransactions.length > 0) {
      setTransactions(initialTransactions);
    }
  }, [initialTransactions]);

  const getTransactionTheme = (isOutgoing: boolean) => {
    return isOutgoing
      ? {
          icon: '↗',
          wrapperClasses: 'text-red-500 bg-red-500/10 border border-red-500/20',
          amountPrefix: '-',
          label: 'Virement Sortant',
        }
      : {
          icon: '↙',
          wrapperClasses: 'text-green-500 bg-green-500/10 border border-green-500/20',
          amountPrefix: '+',
          label: 'Virement Reçu',
        };
  };

  if (loading) {
    return <div className="text-brand-muted">Chargement des transactions...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-brand-danger bg-brand-danger/10 p-4 rounded-xl">
        <AlertCircle size={20} />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-brand-muted">
        <Receipt size={40} className="mb-4 opacity-20" />
        <p>Aucune transaction récente</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {transactions.map((tx) => {
        const isOutgoing = currentAccountNumber ? tx.senderAccountNumber === currentAccountNumber || tx.type === 'WITHDRAWAL' : tx.type === 'WITHDRAWAL';
        const theme = getTransactionTheme(isOutgoing);

        return (
          <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-white/[0.03] group">
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${theme.wrapperClasses}`}>
                {theme.icon}
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-brand-fg">
                  {theme.label}
                </h4>
                <p className="text-xs text-brand-muted mt-0.5">
                  {isOutgoing ? `À ${tx.recipientAccountNumber}` : `De ${tx.senderAccountNumber}`}
                </p>
              </div>
            </div>
            <div className={`text-[15px] font-bold tabular-nums ${isOutgoing ? 'text-red-500' : 'text-green-500'}`}>
              {theme.amountPrefix}{tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionsList;