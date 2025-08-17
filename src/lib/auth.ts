import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "oneid",
      name: "OneID",
      type: "oauth",
      authorization: {
        url: "https://auth.oneid.com/oauth/authorize",
        params: {
          scope: "openid profile email",
          response_type: "code",
        },
      },
      token: "https://auth.oneid.com/oauth/token",
      userinfo: "https://auth.oneid.com/oauth/userinfo",
      clientId: process.env.ONEID_CLIENT_ID,
      clientSecret: process.env.ONEID_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}