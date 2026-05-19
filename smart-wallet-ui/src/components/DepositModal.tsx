import React, { useState } from 'react'
import { depositFunds } from '../services/transaction.service'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await depositFunds(parseFloat(amount), description || 'Ajout de revenu', category || undefined)

      window.dispatchEvent(new Event('user-updated'))
      onSuccess?.()
      setAmount('')
      setDescription('')
      onClose()
    } catch (error) {
      console.error('Erreur lors du dépôt :', error)
      alert("Impossible d'ajouter le revenu. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-400/80">Transaction</p>
          <h3 className="mt-2 text-xl font-bold text-white">Ajouter un revenu / dépôt</h3>
          <p className="mt-1 text-sm text-slate-400">Enregistre un dépôt sur votre portefeuille actif.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Montant</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Description (Optionnel)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salaire, Freelance..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Catégorie (Optionnel)</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 pr-11 text-slate-100 outline-none transition hover:border-slate-500 focus:border-emerald-500 focus:bg-slate-800 focus:text-white"
              >
                <option value="" className="bg-slate-900 text-slate-300">Sélectionner une catégorie</option>
                <option value="Salaire" className="bg-slate-900 text-slate-100">Salaire</option>
                <option value="Alimentation" className="bg-slate-900 text-slate-100">Alimentation</option>
                <option value="Loisirs" className="bg-slate-900 text-slate-100">Loisirs</option>
                <option value="Transport" className="bg-slate-900 text-slate-100">Transport</option>
                <option value="Factures" className="bg-slate-900 text-slate-100">Factures</option>
                <option value="Autre" className="bg-slate-900 text-slate-100">Autre</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 transition-colors focus-within:text-emerald-400">
                ▾
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-800 px-4 py-2.5 font-medium text-slate-300 transition hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-500 disabled:bg-emerald-800"
            >
              {loading ? 'Traitement...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}