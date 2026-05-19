import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy } from 'lucide-react'
import axios from 'axios'
import TransactionsList from '../components/TransactionsList'
import TransferForm from '../components/TransferForm'
import { DepositModal } from '../components/DepositModal'
import StatCard from '../components/StatCard'
import { getMyWallet } from '../services/wallet.service'
import { getTransactionHistory } from '../services/transaction.service'
import type { TransactionResponse, WalletResponse, Profile } from '../api/types'
import api from '../api/axiosConfig'
import { getProfileDisplayName, getStoredUser, setStoredUser } from '../api/userStorage'

type QuickContact = {
  name: string
  accountNumber: string
  initials: string
}

function getInitialsFromName(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function formatContactName(firstname?: string | null, lastname?: string | null, accountNumber?: string | null): string {
  const fullName = [firstname, lastname].filter(Boolean).join(' ').trim()
  return fullName || accountNumber || 'Contact'
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function buildChartPath(values: number[]): string {
  if (values.length === 0) return ''

  const width = 1000
  const height = 300
  const padding = 24
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2
  const maxValue = Math.max(...values, 1)

  return values
    .map((value, index) => {
      const x = padding + (innerWidth * index) / Math.max(values.length - 1, 1)
      const normalized = value / maxValue
      const y = height - padding - normalized * innerHeight
      return `${index === 0 ? 'M' : 'L'}${x} ${y}`
    })
    .join(' ')
}

function DashboardPage() {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<WalletResponse | null>(null)
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [profile, setProfile] = useState<Profile | null>(() => getStoredUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDepositOpen, setIsDepositOpen] = useState(false)

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
    const syncProfile = () => {
      setProfile(getStoredUser())
      void loadData()
    }

    window.addEventListener('user-updated', syncProfile)
    window.addEventListener('storage', syncProfile)

    return () => {
      window.removeEventListener('user-updated', syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [loadData])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const copyAccountNumber = () => {
    if (wallet?.accountNumber) {
      navigator.clipboard.writeText(wallet.accountNumber)
      // Optional: add a toast notification here
    }
  }

  const dashboardStats = useMemo(() => {
    const currentAccountNumber = wallet?.accountNumber

    const isOutgoingTransaction = (tx: TransactionResponse) => {
      if (!currentAccountNumber) {
        return tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER'
      }

      return (
        tx.type === 'WITHDRAWAL' ||
        (tx.type === 'TRANSFER' && tx.senderAccountNumber === currentAccountNumber)
      )
    }

    const isIncomingTransaction = (tx: TransactionResponse) => {
      if (!currentAccountNumber) {
        return tx.type === 'DEPOSIT'
      }

      return (
        tx.type === 'DEPOSIT' ||
        (tx.type === 'TRANSFER' && tx.recipientAccountNumber === currentAccountNumber)
      )
    }

    const incoming = transactions.filter((tx) => {
      return isIncomingTransaction(tx)
    })

    const outgoing = transactions.filter((tx) => {
      return isOutgoingTransaction(tx)
    })

    const totalIncoming = incoming.reduce((acc, tx) => acc + tx.amount, 0)
    const totalOutgoing = outgoing.reduce((acc, tx) => acc + tx.amount, 0)
    const netBalanceFlow = totalIncoming - totalOutgoing

    const dayKeys = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      return toDayKey(date)
    })

    const seriesValues = dayKeys.map((dayKey) => {
      const dayTransactions = transactions.filter((tx) => (tx.createdAt || '').slice(0, 10) === dayKey)

      return dayTransactions.reduce((acc, tx) => {
        const isIncoming = isIncomingTransaction(tx)
        return acc + (isIncoming ? tx.amount : -tx.amount)
      }, 0)
    })

    const quickContactsMap = new Map<string, QuickContact>()

    transactions
      .filter((tx) => tx.type === 'TRANSFER')
      .forEach((tx) => {
        const currentIsSender = currentAccountNumber && tx.senderAccountNumber === currentAccountNumber
        const currentIsRecipient = currentAccountNumber && tx.recipientAccountNumber === currentAccountNumber

        if (!currentIsSender && !currentIsRecipient) {
          return
        }

        const counterpartyFirstname = currentIsSender ? tx.recipientFirstname : tx.senderFirstname
        const counterpartyLastname = currentIsSender ? tx.recipientLastname : tx.senderLastname
        const counterpartyAccount = currentIsSender ? tx.recipientAccountNumber : tx.senderAccountNumber

        if (!counterpartyAccount) {
          return
        }

        const name = formatContactName(counterpartyFirstname, counterpartyLastname, counterpartyAccount)
        quickContactsMap.set(counterpartyAccount, {
          name,
          accountNumber: counterpartyAccount,
          initials: getInitialsFromName(name),
        })
      })

    return {
      totalIncoming,
      totalOutgoing,
      netBalanceFlow,
      chartPath: buildChartPath(seriesValues),
      chartValues: seriesValues,
      quickContacts: Array.from(quickContactsMap.values()).slice(0, 4),
    }
  }, [transactions, wallet?.accountNumber])

  const monthlyIncomes = dashboardStats.totalIncoming
  const monthlyExpenses = dashboardStats.totalOutgoing
  const netFlow = dashboardStats.netBalanceFlow

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>()
    const currentAccountNumber = wallet?.accountNumber
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    transactions.forEach((tx) => {
      const created = tx.createdAt ? new Date(tx.createdAt) : null
      if (!created) return
      if (created.getMonth() !== currentMonth || created.getFullYear() !== currentYear) return
      if (!currentAccountNumber) {
        if (tx.type === 'DEPOSIT') return
      } else if (tx.type !== 'WITHDRAWAL' && tx.senderAccountNumber !== currentAccountNumber) {
        return
      }

      const key = tx.category || 'Uncategorized'
      const prev = map.get(key) || 0
      map.set(key, prev + (tx.amount || 0))
    })

    return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
  }, [transactions, wallet?.accountNumber])

  const chartLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    })
  }, [])

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
                <span>{wallet?.accountNumber || 'SW-0000-0000'}</span>
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
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-brand-fg">Transfert Rapide</h3>
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(true)}
                  className="rounded-md border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs tracking-normal text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
                >
                  Dépôt
                </button>
              </div>
              <TransferForm onTransferSuccess={loadData} currentWalletNumber={wallet?.accountNumber} />
            </div>
          </aside>

          {/* Right: History Zone */}
          <section className="lg:col-span-2">
            <div className="glass rounded-premium p-8 min-h-100">
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
                <p className="text-brand-muted text-sm mt-2">Flux net calculé depuis l'historique réel</p>
              </div>
              <div className="text-brand-accent font-bold text-2xl">
                {netFlow >= 0 ? '+' : '-'} {Math.abs(netFlow).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </div>
            </div>
            
            <div className="h-75 w-full relative">
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

                {dashboardStats.chartPath && (
                  <>
                    <path
                      d={`${dashboardStats.chartPath} L 976 276 L 24 276 Z`}
                      fill="url(#chartGradient)"
                    />
                    <path
                      d={dashboardStats.chartPath}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </svg>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2 text-[10px] uppercase tracking-[0.18em] text-brand-muted">
              {chartLabels.map((label, index) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span>{label}</span>
                  <span className="text-brand-fg/80">
                    {dashboardStats.chartValues[index]?.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div>
                <h4 className="text-brand-fg font-bold mb-6">Répartition réelle</h4>
                <div className="space-y-6">
                  {categoryTotals.length > 0 ? (
                    categoryTotals.map((item, idx) => {
                      const maxValue = Math.max(...categoryTotals.map(c => Math.abs(c.value)), 1)
                      const width = Math.min(100, (Math.abs(item.value) / maxValue) * 100)
                      const palette = ['var(--accent)', 'var(--danger)', 'var(--muted)', 'var(--accent)']
                      const color = palette[idx % palette.length]

                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-brand-muted">{item.label}</span>
                            <span className="text-brand-fg font-bold">{item.value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                          </div>
                          <div className="h-2 bg-brand-surface rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-1000"
                              style={{ width: `${width}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    [
                      { label: 'Dépôts', value: monthlyIncomes, color: 'var(--accent)' },
                      { label: 'Sorties', value: monthlyExpenses, color: 'var(--danger)' },
                      { label: 'Solde net', value: netFlow, color: 'var(--accent)' },
                    ].map((item) => {
                      const maxValue = Math.max(monthlyIncomes, monthlyExpenses, Math.abs(netFlow), 1)
                      const width = Math.min(100, (Math.abs(item.value) / maxValue) * 100)

                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-brand-muted">{item.label}</span>
                            <span className="text-brand-fg font-bold">{item.value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                          </div>
                          <div className="h-2 bg-brand-surface rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-1000"
                              style={{ width: `${width}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center glass bg-brand-accent/5 border-brand-accent/10 p-6 rounded-2xl">
                <h4 className="text-brand-fg font-bold mb-2">Flux du portefeuille</h4>
                <p className="text-sm text-brand-muted mb-6">Données calculées à partir de vos dépôts, transferts et retraits réels.</p>
                <div className="text-3xl font-bold text-brand-accent">
                  {wallet?.balance?.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) || '0,00'} €
                </div>
                <div className="text-xs text-brand-muted mt-1 uppercase tracking-wider">Solde actuel synchronisé</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Transfer Contacts */}
        <section className="col-span-full animate-fade-in" style={{ animationDelay: '0.55s' }}>
          <div className="glass rounded-premium p-8">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-brand-fg">Contacts récents</h3>
                <p className="text-sm text-brand-muted mt-1">Entreprises et particuliers extraits de votre historique réel.</p>
              </div>
              <button className="text-sm font-medium text-brand-accent hover:underline">Voir les détails</button>
            </div>

            {dashboardStats.quickContacts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {dashboardStats.quickContacts.map((contact) => (
                  <button
                    key={contact.accountNumber}
                    type="button"
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/3 p-4 text-left transition hover:border-white/20 hover:bg-white/6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/20 bg-linear-to-br from-cyan-500/20 to-indigo-500/20 text-sm font-bold text-white ring-2 ring-cyan-400/10">
                      {contact.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-brand-fg">{contact.name}</div>
                      <div className="truncate text-xs text-brand-muted">{contact.accountNumber}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 p-6 text-sm text-brand-muted">
                Aucun contact récent n'est disponible pour le moment.
              </div>
            )}
          </div>
        </section>
      </div>

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => {
          void loadData()
        }}
      />
    </div>
  )
}

export default DashboardPage