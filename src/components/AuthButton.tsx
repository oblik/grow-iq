'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useHydration } from '@/hooks/useHydration'

export function AuthButton() {
  const { data: session, status } = useSession()
  const isHydrated = useHydration()

  if (!isHydrated || status === 'loading') {
    return <div className="animate-pulse bg-gray-300 h-10 w-24 rounded border"></div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-800 font-medium">
          Welcome, {session.user?.name || session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('oneid')}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
    >
      Sign in with OneID
    </button>
  )
}