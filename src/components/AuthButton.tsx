'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useHydration } from '@/hooks/useHydration'
import { useState } from 'react'

export function AuthButton() {
  const { data: session, status } = useSession()
  const isHydrated = useHydration()
  
  // Simulate authentication state for demo purposes
  const [simulatedUser, setSimulatedUser] = useState<{name: string, email: string} | null>(null)
  
  const handleSimulatedSignIn = () => {
    setSimulatedUser({
      name: 'Aloys Jehwin',
      email: 'aloys.jehwin@growiq.com'
    })
  }
  
  const handleSimulatedSignOut = () => {
    setSimulatedUser(null)
  }

  if (!isHydrated || status === 'loading') {
    return <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-10 w-24 rounded border"></div>
  }

  // Use simulated user for demo, fallback to real session if available
  const currentUser = simulatedUser || session?.user

  if (currentUser) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
          Welcome, {currentUser.name || currentUser.email}
        </span>
        <button
          onClick={simulatedUser ? handleSimulatedSignOut : () => signOut()}
          className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSimulatedSignIn}
      className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
    >
      Sign in with OneID
    </button>
  )
}