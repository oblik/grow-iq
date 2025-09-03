'use client'

import { useEffect, useState } from 'react'
import { useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit'
import { useSession, signIn, signOut } from 'next-auth/react'

export function useOneChainAuth() {
  const currentAccount = useCurrentAccount()
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage()
  const { data: session, status } = useSession()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (currentAccount && !session && !isAuthenticating) {
      authenticateWithOneChain()
    } else if (!currentAccount && session) {
      // Sign out if wallet disconnects
      signOut({ redirect: false })
    }
  }, [currentAccount, session])

  const authenticateWithOneChain = async () => {
    if (!currentAccount) {
      console.error('No OneChain account connected')
      return
    }

    setIsAuthenticating(true)
    
    try {
      // Create a message to sign
      const message = `Sign this message to authenticate with GrowIQ\nAddress: ${currentAccount.address}\nTimestamp: ${Date.now()}`
      
      // Request signature from wallet
      const { signature, bytes } = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      })

      // Sign in with NextAuth using credentials provider
      const result = await signIn('onechain', {
        address: currentAccount.address,
        signature,
        message,
        redirect: false,
      })

      if (result?.error) {
        console.error('Authentication failed:', result.error)
      } else {
        console.log('Successfully authenticated with OneChain')
      }
    } catch (error) {
      console.error('Failed to authenticate:', error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  return {
    isAuthenticated: !!session,
    isAuthenticating,
    session,
    authenticate: authenticateWithOneChain,
    logout,
    address: currentAccount?.address,
  }
}