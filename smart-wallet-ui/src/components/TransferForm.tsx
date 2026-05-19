import { useState } from 'react'
import { Send, CheckCircle2, Loader2, Sparkles, AlertCircle, ArrowRightLeft, ReceiptText } from 'lucide-react'
import type { TransferRequest, TransactionResponse } from '../api/types'
import { initiateTransfer, withdrawFunds } from '../services/transaction.service'

interface TransferFormProps {
    onTransferSuccess?: (transaction: TransactionResponse) => void
    onError?: (error: string) => void
    currentWalletNumber?: string
}

function TransferForm({ onTransferSuccess, onError, currentWalletNumber }: TransferFormProps) {
    const [transactionMode, setTransactionMode] = useState<'transfer' | 'expense'>('expense')
    const [formData, setFormData] = useState<TransferRequest>({
        receiverWalletNumber: '',
        amount: 0,
        description: '',
        category: ''
    })
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [receiverFieldError, setReceiverFieldError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }))
        // Clear success state on new input
        if (successMessage) setSuccessMessage('')
        if (errorMessage) setErrorMessage('')
        if (receiverFieldError && name === 'receiverWalletNumber') setReceiverFieldError('')
    }

    const handleModeChange = (mode: 'transfer' | 'expense') => {
        setTransactionMode(mode)
        setSuccessMessage('')
        setErrorMessage('')
        setReceiverFieldError('')
        setFormData(prev => ({
            ...prev,
            receiverWalletNumber: mode === 'expense' ? '' : prev.receiverWalletNumber,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccessMessage('')
        setErrorMessage('')
        setReceiverFieldError('')

        if (transactionMode === 'transfer' && !formData.receiverWalletNumber.trim()) {
            const msg = 'Veuillez entrer le numéro de compte du destinataire'
            setReceiverFieldError(msg)
            onError?.(msg)
            setLoading(false)
            return
        }

        if (transactionMode === 'transfer' && currentWalletNumber && formData.receiverWalletNumber === currentWalletNumber) {
            const msg = "Opération impossible : Vous ne pouvez pas effectuer un virement vers votre propre portefeuille."
            setReceiverFieldError(msg)
            onError?.(msg)
            setLoading(false)
            return
        }

        if (formData.amount <= 0) {
            const msg = 'Le montant doit être supérieur à 0'
            setErrorMessage(msg)
            onError?.(msg)
            setLoading(false)
            return
        }

        try {
            const response = transactionMode === 'expense'
                ? await withdrawFunds(
                    formData.amount,
                    formData.description || 'Dépense personnelle',
                    formData.category || undefined,
                )
                : await initiateTransfer(formData)

            setSuccessMessage(transactionMode === 'expense' ? 'Dépense enregistrée avec succès !' : 'Virement effectué avec succès !')
            setFormData({
                receiverWalletNumber: '',
                amount: 0,
                description: '',
                category: ''
            })
            onTransferSuccess?.(response)
        } catch (error: any) {
            const backendErrors = error.response?.data?.errors
            const receiverError = backendErrors?.receiver_wallet_number?.[0] || backendErrors?.receiverWalletNumber?.[0]
            if (error.response?.status === 422 && receiverError) {
                setReceiverFieldError(receiverError)
                setErrorMessage('')
                onError?.(receiverError)
                return
            }

            const errorMsg = error.response?.data?.message || 'Erreur lors du virement'
            setErrorMessage(errorMsg)
            onError?.(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`relative transition-all duration-500 ${successMessage ? 'scale-[1.01]' : ''}`}>
            {/* Optional Success Background Glow */}
            <div 
                className={`pointer-events-none absolute inset-0 -z-10 rounded-4xl bg-emerald-400/20 blur-[60px] transition-opacity duration-700 ${successMessage ? 'opacity-100' : 'opacity-0'}`} 
            />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-widest text-cyan-400 uppercase">
                        <Sparkles className="h-3.5 w-3.5" />
                        Virement Express
                    </p>
                    <p className="text-sm font-medium text-slate-400">
                        Déclarez une dépense ou envoyez de l'argent instantanément et sans frais.
                    </p>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-2">
                <button
                    type="button"
                    onClick={() => handleModeChange('expense')}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${transactionMode === 'expense' ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30' : 'text-slate-300 hover:bg-white/5'}`}
                >
                    <ReceiptText className="h-4 w-4" />
                    Déclarer une Dépense
                </button>
                <button
                    type="button"
                    onClick={() => handleModeChange('transfer')}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${transactionMode === 'transfer' ? 'bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/30' : 'text-slate-300 hover:bg-white/5'}`}
                >
                    <ArrowRightLeft className="h-4 w-4" />
                    Faire un Virement
                </button>
            </div>

            {successMessage && (
                <div className="mb-8 flex items-center gap-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/80 p-5 text-emerald-700 shadow-lg shadow-emerald-500/10 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold tracking-tight">C'est envoyé !</p>
                        <p className="text-sm font-medium text-emerald-600/80">{successMessage}</p>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="mb-8 flex items-center gap-4 rounded-2xl border border-rose-200/60 bg-rose-500/10 p-5 text-rose-300 shadow-lg shadow-rose-500/10 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold tracking-tight text-rose-400">Erreur</p>
                        <p className="text-sm font-medium text-rose-300/80">{errorMessage}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Massive Amount Input Section */}
                <div className="flex flex-col items-center justify-center py-6">
                    <label className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                        Montant
                    </label>
                    <div className="group relative flex items-baseline justify-center gap-2">
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount || ''}
                            required
                            step="0.01"
                            min="0"
                            className="w-full max-w-70 bg-transparent p-0 text-center text-6xl font-black tracking-tighter text-white border-none outline-none focus:ring-0 placeholder:text-white/20 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0.00"
                            onChange={handleChange}
                        />
                        <span className="text-3xl font-bold text-white/40 transition-colors duration-300 group-focus-within:text-cyan-400">
                            TND
                        </span>
                    </div>
                    <div className="mt-2 h-0.5 w-24 rounded-full bg-white/10 transition-all duration-300 group-focus-within:w-32 group-focus-within:bg-cyan-400" />
                </div>

                {/* 2. Soft Pill-shaped Inputs */}
                <div className="space-y-4">
                    {transactionMode === 'transfer' && (
                        <div className="group relative">
                            <input
                                type="text"
                                name="receiverWalletNumber"
                                id="receiverWalletNumber"
                                value={formData.receiverWalletNumber}
                                required
                                className="peer w-full rounded-2xl border border-white/10 bg-white/5 px-5 pb-3 pt-6 text-white outline-none backdrop-blur-sm transition-all duration-300 hover:border-white/20 focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/20 placeholder-transparent"
                                placeholder="SW-0000-0000"
                                onChange={handleChange}
                            />
                            <label 
                                htmlFor="receiverWalletNumber"
                                className="pointer-events-none absolute left-5 top-2 text-xs font-bold text-cyan-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-cyan-400"
                            >
                                Compte du destinataire
                            </label>
                            {receiverFieldError && (
                                <p className="mt-2 text-sm font-medium text-rose-300">
                                    {receiverFieldError}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="group relative">
                        <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            className="peer w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 pb-3 pt-6 text-white outline-none backdrop-blur-sm transition-all duration-300 hover:border-white/20 focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/20 placeholder-transparent"
                            placeholder="Raison du transfert..."
                            rows={2}
                            onChange={handleChange}
                        />
                        <label 
                            htmlFor="description"
                            className="pointer-events-none absolute left-5 top-2 text-xs font-bold text-cyan-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:font-bold peer-focus:text-cyan-400"
                        >
                            Note (Optionnelle)
                        </label>
                    </div>
                </div>

                <div className="group relative">
                    <label className="mb-1 block text-sm font-medium text-slate-400">Catégorie (Optionnel)</label>
                    <div className="relative">
                        <select
                            name="category"
                            value={formData.category || ''}
                            required
                            onChange={handleChange}
                            className="w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 pr-11 text-slate-100 outline-none backdrop-blur-sm transition-all duration-300 hover:border-slate-500 focus:border-cyan-500 focus:bg-slate-800 focus:text-white"
                        >
                            <option value="" className="bg-slate-900 text-slate-300">Sélectionner une catégorie</option>
                            <option value="Alimentation" className="bg-slate-900 text-slate-100">Alimentation</option>
                            <option value="Loisirs" className="bg-slate-900 text-slate-100">Loisirs</option>
                            <option value="Transport" className="bg-slate-900 text-slate-100">Transport</option>
                            <option value="Factures" className="bg-slate-900 text-slate-100">Factures</option>
                            <option value="Autre" className="bg-slate-900 text-slate-100">Autre</option>
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 transition-colors group-focus-within:text-cyan-400">
                            ▾
                        </span>
                    </div>
                </div>

                {/* 3. Hero Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 px-4 py-4.5 text-lg font-bold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.7)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                >
                    <div className="absolute inset-0 bg-linear-to-r from-sky-400 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    <div className="relative flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Traitement en cours...</span>
                            </>
                        ) : (
                            <>
                                <span>{transactionMode === 'expense' ? 'Enregistrer la dépense' : 'Confirmer le virement'}</span>
                                <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:-translate-y-1.5" />
                            </>
                        )}
                    </div>
                </button>
            </form>
        </div>
    )
}

export default TransferForm