import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// Edge-compatible config (no adapter, no Node.js-only modules)
export default {
  trustHost: true,
  providers: [Google({ allowDangerousEmailAccountLinking: true })],
  pages: { signIn: "/sign-in" },
  cookies: {
    state: {
      name: "authjs.state",
      options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
    },
    pkceCodeVerifier: {
      name: "authjs.pkce.code_verifier",
      options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
    },
    csrfToken: {
      name: "authjs.csrf-token",
      options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
    },
  },
} satisfies NextAuthConfig
