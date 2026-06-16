import type { NextAuthOptions, Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    role?: string
  }
  interface User {
    accessToken?: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const apiUrl = process.env.API_URL ?? "http://localhost:8000"
        try {
          const res = await fetch(`${apiUrl}/api/v1/staff/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email ?? "",
              password: credentials?.password ?? "",
            }),
          })
          if (!res.ok) return null
          const data = await res.json()
          return {
            id: String(data.staff_id ?? data.id ?? ""),
            name: data.name ?? credentials?.email ?? "",
            accessToken: data.access_token,
            role: data.role,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.accessToken = user.accessToken
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string
      }
      session.accessToken = token.accessToken
      session.role = token.role
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
