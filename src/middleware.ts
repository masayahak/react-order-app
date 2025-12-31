import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 認証チェックは各ページで行う
  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/customers/:path*', '/products/:path*'],
};

