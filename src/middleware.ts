import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ 
    req: request,
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
  });

  const url = request.nextUrl.clone();

  const publicPaths = ['/', '/signin', '/signup', '/verify', '/products'];

  const authPages = ['/signin', '/signup', '/verify'];

  const matchesPrefix = (paths: string[]) =>
    paths.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));

  const isPublicPath = matchesPrefix(publicPaths);
  const isAuthPage = matchesPrefix(authPages);

  const sellerDashboardPath = '/seller-dashboard';
  const customerDashboardPath = '/customer-dashboard';

  const isSellerPath = matchesPrefix([sellerDashboardPath, '/seller']);
  const isCustomerPath = matchesPrefix([customerDashboardPath, '/dashboard']);

  if (token && isAuthPage) {
    console.log('User already authenticated, redirecting to appropriate dashboard');

    if (token.role === 'seller') {
      return NextResponse.redirect(new URL(sellerDashboardPath, request.url));
    } else {
      return NextResponse.redirect(new URL(customerDashboardPath, request.url));
    }
  }

  if (isSellerPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    if (token.role !== 'seller') {
      console.log('Non-seller attempting to access seller area');
      return NextResponse.redirect(new URL(customerDashboardPath, request.url));
    }
  }

  if (!token && isCustomerPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/signin',
    '/signup',
    '/verify',
    '/customer-dashboard/:path*',
    '/seller-dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/cart/:path*',
    '/orders/:path*',
    '/negotiations/:path*',
    '/products/:path*'
  ],
}