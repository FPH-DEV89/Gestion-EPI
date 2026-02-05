import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const authCookie = request.cookies.get('admin_auth')

    // Si on essaie d'accéder à l'admin sans être connecté
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!authCookie || authCookie.value !== 'true') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

// Configurer les routes sur lesquelles le middleware s'exécute
export const config = {
    matcher: ['/admin/:path*'],
}
