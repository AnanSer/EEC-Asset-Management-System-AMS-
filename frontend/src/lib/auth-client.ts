// EEC EAMS – Better Auth Client Configuration (Phase 9A)
// Frontend auth client — no UI components, configuration only.
// Import authClient in components/pages to use authentication actions.

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Points to the backend Better Auth handler.
  // In production, set NEXT_PUBLIC_BETTER_AUTH_URL to your API domain.
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000",
});

// Export commonly used auth client methods for convenience.
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
