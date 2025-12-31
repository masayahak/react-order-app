import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  // 認証チェックは各ページで行う
  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/customers/:path*', '/products/:path*'],
};

