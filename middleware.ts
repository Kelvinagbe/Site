import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const origin = request.headers.get('origin')
  
  // Check if it's a browser request
  const isBrowser = userAgent.includes('Mozilla') || 
                   userAgent.includes('Chrome') || 
                   userAgent.includes('Safari') || 
                   userAgent.includes('Firefox') ||
                   userAgent.includes('Edge')
  
  // Block browser requests
  if (isBrowser) {
    return new NextResponse(
      JSON.stringify({ error: 'Browser access not allowed' }), 
      { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
  
  // Allow server-to-server requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply to all API routes
   '/api/:path*',
    // Or apply to specific routes
    // '/protected/:path*',
    // Apply to all routes except static files
    // '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}