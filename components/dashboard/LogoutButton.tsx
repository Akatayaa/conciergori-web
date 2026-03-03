'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button onClick={handleLogout}
      className="text-xs hover:underline mt-1 block transition-opacity hover:opacity-80"
      style={{ color: '#73c7d6' }}>
      Déconnexion →
    </button>
  )
}
