// EEC EAMS - Better Auth Client Configuration (Phase 9A & 9B)
// Frontend auth client configuration using Better Auth React client.

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:5000',
});

// Export commonly used auth client methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
