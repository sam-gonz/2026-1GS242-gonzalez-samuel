import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

interface UserProfile {
  id: string
  username: string
  email: string
  reputation: number
  stripeConnectStatus: string
  bio?: string
  avatarUrl?: string
}

export function ProfileSettingsPage() {
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = await getToken()
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/me/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!res.ok) throw new Error('Error cargando perfil')
        const data = await res.json()
        setProfile(data.user)
        setUsername(data.user.username ?? '')
        setBio(data.user.bio ?? '')
        setAvatarUrl(data.user.avatarUrl ?? '')
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [getToken])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const token = await getToken()
      const body: Record<string, string> = {}
      if (username.trim()) body.username = username.trim()
      if (bio.trim()) body.bio = bio.trim()
      if (avatarUrl.trim()) body.avatarUrl = avatarUrl.trim()

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/me/profile`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar')

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              username: data.user.username,
              bio: data.user.bio ?? '',
              avatarUrl: data.user.avatarUrl ?? '',
            }
          : prev
      )
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Header */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-sm text-[var(--color-brand)] hover:underline flex items-center gap-1"
      >
        ← Volver al Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-1">Configuración de perfil</h1>
      <p className="text-sm text-gray-500 mb-8">Edita tu información pública</p>

      {/* Avatar preview */}
      {avatarUrl && (
        <div className="flex justify-center mb-6">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-brand)]"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
        </div>
      )}

      {/* Info de solo lectura */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Email</span>
          <span className="font-medium">{profile?.email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Reputación</span>
          <span className="font-medium">⭐ {profile?.reputation ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Stripe</span>
          <span
            className={`font-medium ${
              profile?.stripeConnectStatus === 'active'
                ? 'text-green-600'
                : 'text-yellow-600'
            }`}
          >
            {profile?.stripeConnectStatus}
          </span>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
          <p className="text-xs text-gray-400 mt-1">{username.length}/30</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Cuéntanos algo sobre ti..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
          <p className="text-xs text-gray-400 mt-1">{bio.length}/300</p>
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-sm font-medium mb-1">URL de avatar</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
          <p className="text-xs text-gray-400 mt-1">Pega el link de tu imagen de perfil</p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200">
            ✅ Perfil actualizado correctamente
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[var(--color-brand)] text-white font-semibold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
