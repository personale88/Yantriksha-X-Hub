import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS_REGEX = [
  /^https?:\/\/localhost:\d+$/,
  /^https?:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.veltech\.edu\.in$/
];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Only apply CORS rules to API endpoints
  if (path.startsWith('/api/')) {
    const origin = req.headers.get('origin');
    
    // If there is an Origin header (cross-origin request), check it against whitelist
    if (origin) {
      const isAllowed = ALLOWED_ORIGINS_REGEX.some(regex => regex.test(origin));
      
      if (!isAllowed) {
        console.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
        return NextResponse.json(
          { success: false, error: 'CORS policy violation: Unauthorized origin' },
          { status: 400 }
        );
      }

      // Handle Preflight OPTIONS requests
      if (req.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        return response;
      }

      // For standard methods, inject CORS headers into Next response
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }
  }

  return NextResponse.next();
}

// Ensure middleware runs only on API paths to optimize performance
export const config = {
  matcher: '/api/:path*'
};
