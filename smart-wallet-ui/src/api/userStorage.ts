import type { Profile } from './types'

export const USER_STORAGE_KEY = 'user'
export const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'

export function getStoredUser(): Profile | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawUser = localStorage.getItem(USER_STORAGE_KEY)
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as Profile
  } catch {
    return null
  }
}

export function setStoredUser(user: Profile): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function getProfileDisplayName(user: Profile | null): string {
  if (!user) {
    return 'Profil'
  }

  const firstName = user.firstname?.trim() ?? ''
  const lastName = user.lastname?.trim() ?? ''
  const nameParts = [firstName, lastName].filter((part) => part.length > 0)
  if (nameParts.length > 0) {
    return nameParts.join(' ')
  }

  if (user.fullName) {
    return user.fullName
  }

  if (user.username) {
    return user.username
  }

  return 'Profil'
}

export function getAvatarUrl(user: Profile | null): string {
  if (!user) {
    return DEFAULT_AVATAR_URL
  }

  const image = user.image?.trim()
  if (image) {
    return image
  }

  const avatarUrl = user.avatarUrl?.trim()
  if (avatarUrl) {
    return avatarUrl
  }

  return DEFAULT_AVATAR_URL
}
