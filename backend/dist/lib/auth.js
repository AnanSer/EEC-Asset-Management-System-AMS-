"use strict";
// EEC EAMS – Better Auth Configuration (Phase 9A, 9B & 9C)
// Connected to PostgreSQL via Prisma adapter with isolated Better Auth tables.
// Configures Email Verification & Password Recovery with Resend (Phase 9C).
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const prisma_2 = __importDefault(require("./prisma"));
const email_1 = require("./email");
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
exports.auth = (0, better_auth_1.betterAuth)({
    appName: 'EEC Enterprise Asset Management System',
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
    trustedOrigins: [
        frontendUrl,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    secret: process.env.BETTER_AUTH_SECRET,
    database: (0, prisma_1.prismaAdapter)(prisma_2.default, {
        provider: 'postgresql',
    }),
    user: {
        modelName: 'authUser',
    },
    session: {
        modelName: 'authSession',
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },
    account: {
        modelName: 'authAccount',
    },
    verification: {
        modelName: 'authVerification',
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        resetPasswordTokenExpiresIn: 1800, // 30 minutes in seconds
        async sendResetPassword({ user, token }) {
            const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
            await (0, email_1.sendPasswordResetEmail)({
                to: user.email,
                name: user.name,
                resetUrl,
                token,
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: 3600, // 60 minutes in seconds
        async sendVerificationEmail({ user, token }) {
            const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
            await (0, email_1.sendVerificationEmail)({
                to: user.email,
                name: user.name,
                verificationUrl,
                token,
            });
        },
    },
    databaseHooks: {
        user: {
            update: {
                after: async (user) => {
                    if (user.emailVerified) {
                        try {
                            await prisma_2.default.user.updateMany({
                                where: { email: user.email },
                                data: { isEmailVerified: true },
                            });
                        }
                        catch (err) {
                            console.error('[databaseHooks:user.update] Error updating business user emailVerified status:', err);
                        }
                    }
                },
            },
        },
    },
    advanced: {
        crossSubDomainCookies: {
            enabled: false,
        },
        useSecureCookies: process.env.NODE_ENV === 'production',
    },
});
//# sourceMappingURL=auth.js.map