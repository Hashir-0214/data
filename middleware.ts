import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;

    // 1. Decrypt the session
    const payload = session ? await decrypt(session) : null;

    // 2. Define public routes
    const isPublicRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/api/auth');

    // 3. Redirect to /login if not authenticated and trying to access a protected route
    if (!payload && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. Redirect to / if authenticated and trying to access /login
    if (payload && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
