/**
 * Email/password authentication is temporarily OFF — Google sign-in only.
 *
 * Why: production has no email provider configured yet (Resend key + verified
 * sending domain), so verification codes and password-reset emails can't be sent.
 *
 * To turn it back on: set NEXT_PUBLIC_EMAIL_AUTH_ENABLED=true in Vercel
 * (Production) and redeploy. No code change is needed. It is a NEXT_PUBLIC_ var
 * because the sign-in page reads it in the browser; the API routes and
 * auth.ts read the same variable on the server.
 */
export const EMAIL_AUTH_ENABLED = process.env.NEXT_PUBLIC_EMAIL_AUTH_ENABLED === "true"

export const EMAIL_AUTH_DISABLED_MESSAGE =
  "Email sign-in is temporarily unavailable. Please continue with Google."
