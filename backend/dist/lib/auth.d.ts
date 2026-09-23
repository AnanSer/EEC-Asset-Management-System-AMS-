export declare const auth: import("better-auth").Auth<{
    appName: string;
    baseURL: string;
    trustedOrigins: string[];
    secret: string | undefined;
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").DBAdapter<import("better-auth").BetterAuthOptions>;
    user: {
        modelName: "authUser";
    };
    session: {
        modelName: "authSession";
        expiresIn: number;
        updateAge: number;
        cookieCache: {
            enabled: true;
            maxAge: number;
        };
    };
    account: {
        modelName: "authAccount";
    };
    verification: {
        modelName: "authVerification";
    };
    emailAndPassword: {
        enabled: true;
        requireEmailVerification: false;
        minPasswordLength: number;
        maxPasswordLength: number;
        resetPasswordTokenExpiresIn: number;
        sendResetPassword({ user, token }: {
            user: import("better-auth").User;
            url: string;
            token: string;
        }): Promise<void>;
    };
    emailVerification: {
        sendOnSignUp: true;
        autoSignInAfterVerification: true;
        expiresIn: number;
        sendVerificationEmail({ user, token }: {
            user: import("better-auth").User;
            url: string;
            token: string;
        }): Promise<void>;
    };
    databaseHooks: {
        user: {
            update: {
                after: (user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, unknown>) => Promise<void>;
            };
        };
    };
    advanced: {
        crossSubDomainCookies: {
            enabled: false;
        };
        useSecureCookies: boolean;
    };
}>;
export type Auth = typeof auth;
//# sourceMappingURL=auth.d.ts.map