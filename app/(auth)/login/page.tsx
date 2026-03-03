'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/conciergori/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#fff2e0' }}>

      {/* Card blanche */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg px-8 py-10">

        {/* Logo + titre */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Concierg'ori" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="font-[var(--font-suez)] text-3xl font-bold" style={{ color: '#00243f' }}>
            Concierg'ori
          </h1>
          <p className="text-sm mt-1" style={{ color: '#979797' }}>Espace de gestion</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-[#0097b2] transition-colors"
              style={{ borderColor: '#e8d8c0' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Mot de passe</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:border-[#0097b2] transition-colors"
              style={{ borderColor: '#e8d8c0' }}
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity disabled:opacity-50 mt-2"
            style={{ backgroundColor: '#0097b2' }}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
