import { signOut } from "next-auth/react"

/**
 * Robust logout: clears Auth.js session + any stale cookie variants,
 * then hard-navigates to /sign-in to ensure a clean state.
 */
export async function robustSignOut() {
  // 1. Let Auth.js clear its own cookies
  try {
    await signOut({ redirect: false })
  } catch {
    // signOut may fail if session is already invalid — continue anyway
  }

  // 2. Manually clear all possible cookie name variants
  // Auth.js may have set cookies under different names depending on
  // env/HTTPS context. Clear them all to prevent ghost sessions.
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.state",
    "authjs.pkce.code_verifier",
  ]

  for (const name of cookieNames) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  // 3. Hard navigate to sign-in — forces full page reload, clears React state
  window.location.replace("/sign-in")
}
