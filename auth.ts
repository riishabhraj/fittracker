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
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
})
