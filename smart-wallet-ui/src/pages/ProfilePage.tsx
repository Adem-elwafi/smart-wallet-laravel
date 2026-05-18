import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import axios from 'axios'
import api from '../api/axiosConfig'
import type { Profile, UpdateProfileRequest } from '../api/types'
import { getAvatarUrl, getProfileDisplayName, getStoredUser, setStoredUser } from '../api/userStorage'

// ─── Floating Label Input ─────────────────────────────────────────────────────
interface FloatingInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
  disabled?: boolean
}

function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  disabled,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0

  return (
    <div className="relative group">
      {/* Glow ring on focus */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
          bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 blur-sm
          ${focused ? 'opacity-100' : 'opacity-0'}`}
      />

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        disabled={disabled}
        placeholder=""
        className={`
          peer relative w-full rounded-xl px-4 pt-6 pb-2.5 text-sm font-light
          bg-white/5 backdrop-blur-md
          border transition-all duration-200 outline-none
          text-white placeholder-transparent
          disabled:opacity-40 disabled:cursor-not-allowed
          ${focused
            ? 'border-cyan-500/60 shadow-[0_0_0_1px_rgba(6,182,212,0.3)]'
            : 'border-white/10 hover:border-white/20'
          }
        `}
      />

      <label
        htmlFor={id}
        className={`
          absolute left-4 pointer-events-none font-light transition-all duration-200 select-none
          ${lifted
            ? 'top-2 text-[10px] tracking-widest uppercase text-cyan-400'
            : 'top-4 text-sm text-white/40'
          }
        `}
      >
        {label}
      </label>
    </div>
  )
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
interface AlertProps {
  type: 'error' | 'success'
  message: string
}

function Alert({ type, message }: AlertProps) {
  const isError = type === 'error'

  return (
    <div
      className={`
        flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm font-light
        border backdrop-blur-md
        animate-in fade-in slide-in-from-top-2 duration-300
        ${isError
          ? 'bg-red-500/10 border-red-500/25 text-red-300'
          : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
        }
      `}
    >
      <span className="mt-px shrink-0 text-base" aria-hidden>
        {isError ? '⊗' : '⊕'}
      </span>
      <p>{message}</p>
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  initials: string;
  avatarUrl?: string;
}

function Avatar({ initials, avatarUrl }: AvatarProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse ring */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping [animation-duration:3s]" />
      {/* Glow halo */}
      <div className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-cyan-500/30 via-indigo-500/20 to-violet-500/30 blur-md" />
      {/* Ring */}
      <div className="relative rounded-full ring-4 ring-cyan-500/30 ring-offset-2 ring-offset-[#0a0f1e] overflow-hidden">
        {/* Avatar circle */}
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-950 to-indigo-950 border border-white/10 flex items-center justify-center">
            <span className="text-2xl font-extralight tracking-widest text-white/90 select-none">
              {initials}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section Divider ──────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <span className="text-[10px] tracking-[0.2em] uppercase font-light text-white/30">
        {children}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(() => getStoredUser())
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    email: '',
    fullName: '',
    avatarUrl: '',
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialization fetch
  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const response = await api.get<Profile>('/profile')
        setStoredUser(response.data)
        setProfile(response.data)
        setFormData({
          email: response.data.email || '',
          fullName: response.data.fullName || [response.data.firstname, response.data.lastname].filter((part) => Boolean(part)).join(' '),
          avatarUrl: response.data.image || response.data.avatarUrl || '',
        })
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(typeof err.response?.data === 'string' ? err.response.data : 'Impossible de charger le profil.')
        } else {
          setError('Une erreur inattendue est survenue.')
        }
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  // Calculate dynamic initials for the avatar
  const getInitials = () => {
    if (formData.fullName) {
      const parts = formData.fullName.split(' ').filter(Boolean)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return parts[0].substring(0, 2).toUpperCase()
    }
    if (profile?.firstname || profile?.lastname) {
      const firstInitial = profile.firstname?.trim().charAt(0) ?? ''
      const lastInitial = profile.lastname?.trim().charAt(0) ?? ''
      return `${firstInitial}${lastInitial}`.toUpperCase() || 'US'
    }
    if (profile?.username) return profile.username.substring(0, 2).toUpperCase()
    return 'US'
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev: UpdateProfileRequest) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image est trop grande (max 5MB)")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev: UpdateProfileRequest) => ({ ...prev, avatarUrl: reader.result as string }))
        setError(null)
        setSuccess(null)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const fullName = formData.fullName.trim()
    const nameParts = fullName.split(/\s+/)
    const firstname = nameParts[0] || ''
    const lastname = nameParts.slice(1).join(' ') || firstname

    try {
      const updatePayload = {
        firstname,
        lastname,
        email: formData.email.trim(),
        image: formData.avatarUrl || null,
      }

      const response = await api.put<Profile>('/profile', updatePayload)
      const mergedUser: Profile = {
        ...response.data,
        email: response.data.email || formData.email.trim(),
        avatarUrl: response.data.avatarUrl || response.data.image || formData.avatarUrl || profile?.avatarUrl || '',
        image: response.data.image || formData.avatarUrl || profile?.image || null,
      }

      setStoredUser(mergedUser)
      setProfile(mergedUser)
      setFormData((prev) => ({
        ...prev,
        email: mergedUser.email,
        fullName: [mergedUser.firstname, mergedUser.lastname].filter(Boolean).join(' '),
        avatarUrl: getAvatarUrl(mergedUser),
      }))
      window.dispatchEvent(new CustomEvent('user-updated', { detail: mergedUser }))
      setSuccess('Profil mis à jour avec succès.')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(typeof err.response?.data === 'string' ? err.response.data : 'Impossible de mettre à jour le profil.')
      } else {
        setError('Une erreur inattendue est survenue.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500"></div>
          <span className="text-sm font-light tracking-[0.2em] uppercase text-cyan-500/80">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    /* ── Full-page wrapper with animated mesh background ── */
    <div className="relative min-h-[80vh] w-full overflow-hidden flex items-center justify-center px-4 py-8 bg-transparent rounded-3xl">

      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full
          bg-gradient-to-br from-indigo-900/50 to-transparent blur-[120px]
          animate-[drift_18s_ease-in-out_infinite_alternate]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[55vw] h-[55vw] rounded-full
          bg-gradient-to-tl from-cyan-900/40 to-transparent blur-[100px]
          animate-[drift_22s_ease-in-out_infinite_alternate-reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full
          bg-gradient-to-br from-violet-900/25 to-transparent blur-[140px]
          animate-[drift_15s_ease-in-out_infinite_alternate]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Main card ── */}
      <div className="relative w-full max-w-2xl">
        {/* Card glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-violet-500/10 blur-2xl scale-105" />

        <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl overflow-hidden shadow-2xl">

          {/* Top edge shine */}
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* ── Hero header ── */}
          <div className="relative px-8 pt-12 pb-8 flex flex-col items-center text-center overflow-hidden">
            {/* Header background tint */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 to-transparent pointer-events-none" />

            <div className="relative group cursor-pointer rounded-full">
              <Avatar initials={getInitials()} avatarUrl={formData.avatarUrl || getAvatarUrl(profile)} />
              
              {/* Upload Overlay */}
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              {/* Hidden file input */}
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0" 
                onChange={handleImageUpload} 
                disabled={saving}
                title="Changer l'avatar"
              />
            </div>

            <div className="relative mt-6">
              <h1 className="text-xl font-extralight tracking-[0.15em] text-white/90 uppercase">
                {formData.fullName || getProfileDisplayName(profile) || 'Votre Profil'}
              </h1>
              <p className="mt-1 text-xs tracking-[0.3em] uppercase text-cyan-400/70 font-light">
                @{profile?.username || profile?.email || 'user'} · Membre
              </p>
            </div>

            {/* Decorative accent line */}
            <div className="mt-6 w-16 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">

            {/* Alerts */}
            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            {/* Personal info */}
            <div>
              <SectionLabel>Informations Personnelles</SectionLabel>
              <div className="space-y-4">
                <FloatingInput
                  id="fullName"
                  label="Nom complet"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <SectionLabel>Coordonnées</SectionLabel>
              <div className="space-y-4">
                <FloatingInput
                  id="email"
                  label="Adresse e-mail"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={saving}
                />
              </div>
            </div>

            {/* ── Save button ── */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="
                  relative w-full group overflow-hidden rounded-xl
                  px-6 py-4 text-sm font-light tracking-[0.15em] uppercase
                  text-white
                  transition-all duration-200
                  active:scale-[0.97]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                "
              >
                {/* Button gradient background */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600
                  group-hover:from-cyan-500 group-hover:via-indigo-500 group-hover:to-violet-500
                  transition-all duration-300" />

                {/* Glow shadow */}
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                  shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-opacity duration-300" />

                {/* Shimmer sweep */}
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%]
                  bg-gradient-to-r from-transparent via-white/15 to-transparent
                  transition-transform duration-700 ease-in-out" />

                {/* Top highlight */}
                <span className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                {/* Label */}
                <span className="relative flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5 text-white/70"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enregistrement…
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </span>
              </button>
            </div>

          </form>

          {/* Bottom edge shine */}
          <div className="absolute bottom-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Bottom badge */}
        <p className="mt-6 text-center text-[10px] tracking-[0.25em] uppercase text-white/20 font-light">
          SmartWallet · Secured with 256-bit encryption
        </p>
      </div>

      {/* Keyframe for the drifting orbs — injected via style tag */}
      <style>{`
        @keyframes drift {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(2%, 3%) scale(1.05); }
          100% { transform: translate(-1%, -2%) scale(0.97); }
        }
      `}</style>
    </div>
  )
}