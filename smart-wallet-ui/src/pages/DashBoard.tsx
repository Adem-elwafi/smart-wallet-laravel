import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import axios from 'axios'
import TransactionsList from '../components/TransactionsList'
import TransferForm from '../components/TransferForm'
import StatCard from '../components/StatCard'
import { getMyWallet } from '../services/wallet.service'
import { getTransactionHistory } from '../services/transaction.service'
import type { TransactionResponse, WalletResponse, Profile } from '../api/types'
import api from '../api/axiosConfig'
import { getProfileDisplayName, getStoredUser, setStoredUser } from '../api/userStorage'

function DashboardPage() {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<WalletResponse | null>(null)
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [profile, setProfile] = useState<Profile | null>(() => getStoredUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [walletData, txData, profileResponse] = await Promise.all([
        getMyWallet(),
        getTransactionHistory(),
        api.get<Profile>('/profile')
      ])
      setWallet(walletData)
      setTransactions(txData)
      setStoredUser(profileResponse.data)
      setProfile(profileResponse.data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }
        setError('Impossible de charger les données du dashboard.')
      } else {
        setError('Une erreur inattendue est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const syncProfile = () => setProfile(getStoredUser())

    window.addEventListener('user-updated', syncProfile)
    window.addEventListener('storage', syncProfile)

    return () => {
      window.removeEventListener('user-updated', syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const copyAccountNumber = () => {
    if (wallet?.accountNumber) {
      navigator.clipboard.writeText(wallet.accountNumber)
      // Optional: add a toast notification here
    }
  }

  // Calculate some mock stats based on transactions
  const monthlyIncomes = transactions
    .filter(tx => (wallet?.accountNumber ? tx.recipientAccountNumber === wallet.accountNumber : tx.type === 'CREDIT'))
    .reduce((acc, tx) => acc + tx.amount, 0)
  
  const monthlyExpenses = transactions
    .filter(tx => (wallet?.accountNumber ? tx.senderAccountNumber === wallet.accountNumber : tx.type === 'DEBIT'))
    .reduce((acc, tx) => acc + tx.amount, 0)

  if (loading && !wallet) {
    return <div className="flex h-screen items-center justify-center text-brand-accent">Chargement...</div>
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      <header className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-brand-fg tracking-tight">SmartWallet</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-brand-muted">Bonjour, {getProfileDisplayName(profile)}</span>
          <div className="h-10 w-10 rounded-full bg-brand-surface border border-brand-border" />
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Wallet Section */}
        <section className="col-span-full animate-fade-in mb-4">
          <div className="credit-card glass relative h-60 flex flex-col justify-between p-8 rounded-premium overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-glow group cursor-pointer"
               style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(2, 6, 23, 0.4) 100%)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs uppercase tracking-widest text-brand-muted mb-2">Solde Total</div>
                <div className="text-4xl font-bold text-brand-fg">
                  {(wallet?.balance || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </div>
              </div>
              <div className="text-xl font-black text-brand-fg/60">VISA</div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 font-mono text-lg tracking-[0.2em] text-brand-fg/90">
                {wallet?.accountNumber || 'SW-0000-0000'}
                <button 
                  onClick={(e) => { e.stopPropagation(); copyAccountNumber(); }}
                  className="bg-white/5 border border-white/10 text-brand-muted px-2 py-1 rounded-md text-xs tracking-normal hover:bg-white/10 hover:text-brand-fg transition-colors"
                >
                  Copier
                </button>
              </div>
              <div className="text-[10px] text-brand-muted uppercase">Expire fin 05/28</div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Stats Grid */}
        <section className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Revenus ce mois" 
            value={`${monthlyIncomes.toLocaleString('fr-FR')} €`} 
            trend={12} 
            delay="0.1s" 
          />
          <StatCard 
            title="Dépenses" 
            value={`${monthlyExpenses.toLocaleString('fr-FR')} €`} 
            trend={-5} 
            delay="0.2s" 
          />
          <StatCard 
            title="Économies" 
            value={`${(monthlyIncomes - monthlyExpenses).toLocaleString('fr-FR')} €`} 
            trend={8} 
            delay="0.3s" 
          />
        </section>

        {/* Main Grid: Transfer + History */}
        <div className="col-span-full grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {/* Left: Transfer Zone */}
          <aside className="lg:col-span-1 h-fit">
            <div className="glass rounded-premium p-8 h-full">
              <h3 className="text-xl font-bold text-brand-fg mb-6">Transfert Rapide</h3>
              <TransferForm onTransferSuccess={loadData} />
            </div>
          </aside>

          {/* Right: History Zone */}
          <section className="lg:col-span-2">
            <div className="glass rounded-premium p-8 min-h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-brand-fg">Activités Récentes</h3>
                <button className="text-sm font-medium text-brand-accent hover:underline">Voir tout</button>
              </div>
              <TransactionsList transactions={transactions} currentAccountNumber={wallet?.accountNumber} />
            </div>
          </section>
        </div>

        {/* Analytics Section */}
        <section className="col-span-full animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="glass rounded-premium p-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-brand-fg">Analyses</h2>
                <p className="text-brand-muted text-sm mt-2">Dépenses sur les 30 derniers jours</p>
              </div>
              <div className="text-brand-accent font-bold text-2xl">+ 340,50 €</div>
            </div>
            
            <div className="h-[300px] w-full relative">
              <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none" className="overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                {[50, 150, 250].map(y => (
                  <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4,4" />
                ))}

                {/* Area under curve */}
                <path 
                  d="M0 300 L0 200 Q 150 150, 300 220 T 600 100 T 1000 150 L 1000 300 Z" 
                  fill="url(#chartGradient)" 
                />
                
                {/* Main line */}
                <path 
                  d="M0 200 Q 150 150, 300 220 T 600 100 T 1000 150" 
                  fill="none" 
                  stroke="var(--accent)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div>
                <h4 className="text-brand-fg font-bold mb-6">Top Catégories</h4>
                <div className="space-y-6">
                  {[
                    { label: 'Alimentation', value: 45, color: 'var(--accent)' },
                    { label: 'Loisirs', value: 30, color: 'var(--danger)' },
                    { label: 'Transport', value: 15, color: 'var(--accent)' }
                  ].map(cat => (
                    <div key={cat.label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-brand-muted">{cat.label}</span>
                        <span className="text-brand-fg font-bold">{cat.value}%</span>
                      </div>
                      <div className="h-2 bg-brand-surface rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000" 
                          style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center glass bg-brand-accent/5 border-brand-accent/10 p-6 rounded-2xl">
                <h4 className="text-brand-fg font-bold mb-2">Comparaison</h4>
                <p className="text-sm text-brand-muted mb-6">Vous avez dépensé 12% de moins que le mois dernier. Beau travail !</p>
                <div className="text-3xl font-bold text-brand-accent">+ 340,50 €</div>
                <div className="text-xs text-brand-muted mt-1 uppercase tracking-wider">Économisés par rapport à Avril</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default DashboardPage