import { useState } from 'react'
import { Send, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import type { TransferRequest, TransactionResponse } from '../api/types'
import { initiateTransfer } from '../services/transaction.service'

interface TransferFormProps {
    onTransferSuccess?: (transaction: TransactionResponse) => void
    onError?: (error: string) => void
}

function TransferForm({ onTransferSuccess, onError }: TransferFormProps) {
    const [formData, setFormData] = useState<TransferRequest>({
        receiverWalletNumber: '',
        amount: 0,
        description: ''
    })
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }))
        // Clear success state on new input
        if (successMessage) setSuccessMessage('')
        if (errorMessage) setErrorMessage('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSuccessMessage('')
        setErrorMessage('')

        if (!formData.receiverWalletNumber.trim()) {
            const msg = 'Veuillez entrer le numéro de compte du destinataire'
            setErrorMessage(msg)
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
            const response = await initiateTransfer(formData)
            setSuccessMessage(`Virement effectué avec succès !`)
            setFormData({
                receiverWalletNumber: '',
                amount: 0,
                description: ''
            })
            onTransferSuccess?.(response)
        } catch (error: any) {
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
                className={`pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-emerald-400/20 blur-[60px] transition-opacity duration-700 ${successMessage ? 'opacity-100' : 'opacity-0'}`} 
            />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-widest text-cyan-400 uppercase">
                        <Sparkles className="h-3.5 w-3.5" />
                        Virement Express
                    </p>
                    <p className="text-sm font-medium text-slate-400">
                        Envoyez de l'argent instantanément et sans frais.
                    </p>
                </div>
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
                            className="w-full max-w-[280px] bg-transparent p-0 text-center text-6xl font-black tracking-tighter text-white border-none outline-none focus:ring-0 placeholder:text-white/20 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    </div>

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

                {/* 3. Hero Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-4.5 text-lg font-bold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.7)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    <div className="relative flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Traitement en cours...</span>
                            </>
                        ) : (
                            <>
                                <span>Confirmer le virement</span>
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