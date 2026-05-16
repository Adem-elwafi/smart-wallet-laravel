import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'

function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await api.post('/auth/register', formData)
            navigate('/login')
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string } } }
            setError(apiError.response?.data?.message || "Une erreur est survenue lors de l'inscription.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur-xl sm:p-8">
            <div className="mb-8 space-y-2 text-left">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">Register</p>
                <h2 className="text-3xl font-semibold tracking-tight text-white">Create account</h2>
                <p className="text-sm leading-6 text-white/60">
                    Set up your SmartWallet profile and start managing your finances in one place.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <label className="block space-y-2 text-left">
                        <span className="text-sm font-medium text-white/80">Prénom</span>
                        <input
                            name="firstname"
                            type="text"
                            value={formData.firstname}
                            required
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/20"
                            placeholder="Adem"
                            onChange={handleChange}
                        />
                    </label>

                    <label className="block space-y-2 text-left">
                        <span className="text-sm font-medium text-white/80">Nom</span>
                        <input
                            name="lastname"
                            type="text"
                            value={formData.lastname}
                            required
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/20"
                            placeholder="Dev"
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <label className="block space-y-2 text-left">
                    <span className="text-sm font-medium text-white/80">Adresse email</span>
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/20"
                        placeholder="nom@exemple.com"
                        onChange={handleChange}
                    />
                </label>

                <label className="block space-y-2 text-left">
                    <span className="text-sm font-medium text-white/80">Mot de passe</span>
                    <input
                        name="password"
                        type="password"
                        value={formData.password}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/20"
                        placeholder="••••••••"
                        onChange={handleChange}
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-4 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-400 shadow-lg shadow-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? 'Traitement...' : "S'inscrire"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/60">
                Déjà un compte ?{' '}
                <Link to="/login" className="font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline">
                    Se connecter
                </Link>
            </p>
        </div>
    )
}

export default Register