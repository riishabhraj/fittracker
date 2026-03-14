import NextAuth from "next-auth"
import authConfig from "./auth.config"

// Use edge-compatible config (no MongoDB adapter) for middleware
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL("/sign-in", req.url))
  }
})

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - /sign-in (public login page)
     * - /api/auth/* (Auth.js callback routes)
     * - /_next/* (Next.js internals)
     * - /.*\..* (static files: .png, .ico, .json, .js, .css etc.)
     */
    "/((?!sign-in|privacy-policy|api/auth|_next|[^?]*\\.(?:png|jpg|jpeg|gif|ico|svg|css|js|json|txt|xml|webp|woff2?)).*)",
  ],
}
