import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import type { AuthResponse } from '../api/types'

function Login() {
    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials)
            localStorage.setItem('token', response.data.token)
            alert('Connexion réussie !')
            navigate('/dashboard')
        } catch (error) {
            console.error('Erreur de connexion', error)
            alert('Identifiants invalides')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur-xl sm:p-8">
            <div className="mb-8 space-y-2 text-left">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">Login</p>
                <h2 className="text-3xl font-semibold tracking-tight text-white">Sign in</h2>
                <p className="text-sm leading-6 text-white/60">
                    Use your SmartWallet credentials to reach your dashboard.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block space-y-2 text-left">
                    <span className="text-sm font-medium text-white/80">Adresse Email</span>
                    <input
                        type="email"
                        value={credentials.email}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/20"
                        placeholder="nom@exemple.com"
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    />
                </label>

                <label className="block space-y-2 text-left">
                    <span className="text-sm font-medium text-white/80">Mot de passe</span>
                    <input
                        type="password"
                        value={credentials.password}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/20"
                        placeholder="••••••••"
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    />
                </label>

                <button
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-4 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-400 shadow-lg shadow-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/60">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline">
                    Créer un compte
                </Link>
            </p>
        </div>
    )
}

export default Login