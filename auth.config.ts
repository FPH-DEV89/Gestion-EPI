import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = (auth?.user as any)?.role;
            const isAdminPage = nextUrl.pathname.startsWith('/admin');
            const isStatsPage = nextUrl.pathname.startsWith('/statistics');

            if (isAdminPage || isStatsPage) {
                if (isLoggedIn) {
                    if (userRole === "ADMIN") return true;
                    // Logged in but not admin: redirect to an unauthorized page or home
                    return Response.redirect(new URL('/unauthorized', nextUrl));
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // If logged in and trying to access login page, redirect appropriately
                if (nextUrl.pathname === '/login') {
                    if (userRole === "ADMIN") {
                        return Response.redirect(new URL('/admin', nextUrl));
                    }
                    return Response.redirect(new URL('/', nextUrl));
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = (token as any).role;
                (session.user as any).id = (token as any).id as string;
            }
            return session
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
