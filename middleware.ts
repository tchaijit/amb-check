import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  '/scanner': ['driver', 'equipment_officer', 'nurse'],
  '/inspect': ['driver', 'equipment_officer', 'nurse'],
  '/dashboard': ['hod'],
  '/history': ['hod'],
  '/statistics': ['hod'],
  '/qr-generator': ['hod', 'equipment_officer'],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes
  if (pathname === '/' || pathname === '/login' || pathname === '/settings' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!session?.user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for protected routes
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      const userRole = session.user.role as string;
      if (!allowedRoles.includes(userRole)) {
        // Redirect to home page if user doesn't have access
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }

  return NextResponse.next();
});

// Configure which routes should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
