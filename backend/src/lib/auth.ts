// EEC EAMS – Better Auth Configuration (Phase 9A)
// Connects Better Auth to the existing Prisma database.
// Auth tables are isolated from business tables via model name overrides.
// modelName values are camelCase Prisma model accessors (e.g. prisma.authUser).

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './prisma';

export const auth = betterAuth({
  // --- Database ---------------------------------------------------------------
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // --- Model Name Overrides ---------------------------------------------------
  // Map Better Auth internals to our prefixed Prisma models.
  // Prisma accessor names (camelCase): authUser, authSession, authAccount, authVerification
  // These map to DB tables: auth_user, auth_session, auth_account, auth_verification
  // This isolates auth tables from the existing business `User` model.
  user: {
    modelName: 'authUser',
  },
  session: {
    modelName: 'authSession',
  },
  account: {
    modelName: 'authAccount',
  },
  verification: {
    modelName: 'authVerification',
  },

  // --- Auth Provider ----------------------------------------------------------
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // --- Security ---------------------------------------------------------------
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',

  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],

  advanced: {
    cookiePrefix: 'eec_eams',
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  },
});

export type Auth = typeof auth;
