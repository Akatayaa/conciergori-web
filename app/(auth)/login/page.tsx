'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#fff2e0' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-white shadow-sm">
            <img src="/logo.svg" alt="Concierg'ori" className="w-10 h-10" />
          </div>
          <h1 className="font-[var(--font-suez)] text-2xl" style={{ color: '#00243f' }}>Concierg'ori</h1>
          <p className="text-sm mt-1" style={{ color: '#979797' }}>Accès tableau de bord</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="font-[var(--font-alkatra)] text-xl font-bold mb-6" style={{ color: '#00243f' }}>
            Connexion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2] transition-colors"
                style={{ borderColor: '#e8d8c0' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Mot de passe</label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2] transition-colors"
                style={{ borderColor: '#e8d8c0' }}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-700" style={{ backgroundColor: '#fff0f0' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity disabled:opacity-50 mt-2"
              style={{ backgroundColor: '#0097b2' }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#979797' }}>
          Concierg'ori · Espace privé
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
