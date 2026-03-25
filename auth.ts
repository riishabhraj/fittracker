import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import connectDB from "@/lib/mongoose"
import { User } from "@/lib/models/user"
import authConfig from "./auth.config"

class OAuthAccountError extends CredentialsSignin {
  code = "OAuthAccount"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email    = (credentials?.email    as string | undefined)?.toLowerCase().trim()
        const password =  credentials?.password as string | undefined
        if (!email || !password) return null

        await connectDB()
        // `select("+password")` overrides the `select: false` on the schema field
        const user = await User.findOne({ email }).select("+password")
        if (!user) return null
        if (!user.password) throw new OAuthAccountError() // Google-only account

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return { id: user._id.toString(), email: user.email, name: user.name ?? null }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) token.id = user.id
      // Fetch subscription on first login OR when client calls session.update()
      if (user || trigger === "update") {
        await connectDB()
        const id = (token.id as string) ?? user?.id
        const dbUser = await User.findById(id).select("subscription")
        token.plan = dbUser?.subscription?.plan ?? "free"
        token.trialEndsAt = dbUser?.subscription?.trialEndsAt ?? null
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.plan = (token.plan as string) ?? "free"
      session.user.trialEndsAt = token.trialEndsAt as Date | null
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Seed 7-day Pro trial for new OAuth users (credentials users are handled in /api/auth/register)
      await connectDB()
      await User.findByIdAndUpdate(user.id, {
        "subscription.plan": "free",
        "subscription.status": "trialing",
        "subscription.trialEndsAt": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
    },
  },
})
