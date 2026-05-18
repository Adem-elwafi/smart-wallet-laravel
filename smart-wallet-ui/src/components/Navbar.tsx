import { useNavigate } from 'react-router-dom'
import { LogOut, Wallet, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../api/axiosConfig'
import type { Profile } from '../api/types'
import { getAvatarUrl, getProfileDisplayName, getStoredUser, setStoredUser } from '../api/userStorage'

function Navbar() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(() => getStoredUser())
  const [isLightMode, setIsLightMode] = useState(false)

  // Initialize theme from HTML element on mount
  useEffect(() => {
    setIsLightMode(document.documentElement.classList.contains('light-theme'))
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    if (html.classList.contains('light-theme')) {
      html.classList.remove('light-theme')
      setIsLightMode(false)
    } else {
      html.classList.add('light-theme')
      setIsLightMode(true)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<Profile>('/profile')
        setStoredUser(response.data)
        setProfile(response.data)
      } catch (err) {
        console.error("Failed to fetch profile in navbar", err)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    const syncProfile = () => setProfile(getStoredUser())

    window.addEventListener('user-updated', syncProfile)
    window.addEventListener('storage', syncProfile)

    return () => {
      window.removeEventListener('user-updated', syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  const handleLogoClick = () => {
    navigate('/dashboard')
  }

  const getInitials = () => {
    if (profile?.firstname || profile?.lastname) {
      const firstName = profile.firstname?.trim() ?? ''
      const lastName = profile.lastname?.trim() ?? ''
      const parts = [firstName, lastName].filter((part) => part.length > 0)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return parts[0].substring(0, 2).toUpperCase()
    }
    if (profile?.fullName) {
      const parts = profile.fullName.split(' ').filter(Boolean)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return parts[0].substring(0, 2).toUpperCase()
    }
    if (profile?.username) return profile.username.substring(0, 2).toUpperCase()
    return 'US'
  }

  return (
    <nav className="border-b border-white/[0.08] bg-white/[0.03] backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-xl font-bold text-white transition hover:text-cyan-400"
          >
            <Wallet className="h-6 w-6 text-cyan-400" />
            SmartWallet
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Dashboard
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Toggle Theme"
            >
              {isLightMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 rounded-full bg-white/5 p-1 pr-4 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 shadow-sm"
            >
              <img src={getAvatarUrl(profile)} alt="Avatar" className="h-8 w-8 rounded-full object-cover border border-white/20" />
              <span className="text-sm font-medium text-white/90">
                {getProfileDisplayName(profile).split(' ')[0] || 'Profil'}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 transition hover:bg-rose-500 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
