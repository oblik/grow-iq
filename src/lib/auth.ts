import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { verifyPersonalMessageSignature } from '@mysten/sui/verify'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "onechain",
      name: "OneChain Wallet",
      credentials: {
        address: { label: "Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature || !credentials?.message) {
          return null
        }

        try {
          // Verify the signature
          const messageBytes = new TextEncoder().encode(credentials.message)
          const publicKey = await verifyPersonalMessageSignature(
            messageBytes,
            credentials.signature
          )

          if (publicKey) {
            // Return user object if signature is valid
            return {
              id: credentials.address,
              name: credentials.address.slice(0, 6) + '...' + credentials.address.slice(-4),
              email: `${credentials.address}@onechain.local`,
              address: credentials.address,
            }
          }
        } catch (error) {
          console.error('Signature verification failed:', error)
        }

        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // Add OneChain address if available
        if ('address' in user) {
          token.address = (user as any).address
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        // Add OneChain address to session
        if (token.address) {
          (session.user as any).address = token.address
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}