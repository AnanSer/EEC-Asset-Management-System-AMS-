export declare const auth: import("better-auth").Auth<{
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").DBAdapter<import("better-auth").BetterAuthOptions>;
    user: {
        modelName: "authUser";
    };
    session: {
        modelName: "authSession";
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
    };
    secret: string | undefined;
    baseURL: string;
    trustedOrigins: string[];
    advanced: {
        cookiePrefix: string;
        crossSubDomainCookies: {
            enabled: false;
        };
        defaultCookieAttributes: {
            sameSite: "lax";
            secure: boolean;
            httpOnly: true;
        };
    };
}>;
export type Auth = typeof auth;
//# sourceMappingURL=auth.d.ts.map