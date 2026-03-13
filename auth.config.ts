import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// Edge-compatible config (no adapter, no Node.js-only modules)
export default {
  trustHost: true,
  providers: [Google({ allowDangerousEmailAccountLinking: true })],
  pages: { signIn: "/sign-in" },
} satisfies NextAuthConfig
