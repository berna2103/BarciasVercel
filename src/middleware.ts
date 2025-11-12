import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

// The supported locales and default locale from next.config.ts
const locales = ['en', 'es'] 
const defaultLocale = 'en'

// Function to get the preferred locale using negotiation logic
function getLocale(request: NextRequest): string {
  // Negotiator works with standard Node.js headers, so we convert them
  const headers = { 'accept-language': request.headers.get('accept-language') || '' }
  const languages = new Negotiator({ headers }).languages()

  // Use the locale matcher to find the best match
  return match(languages, locales, defaultLocale)
}

// Function to determine if a path already has a locale prefix
function isPathLocalized(pathname: string): boolean {
    const pathnameParts = pathname.split('/').filter(p => p.length > 0);
    const localeSegment = pathnameParts[0];
    return locales.includes(localeSegment);
}


export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // 1. Check if the path is already localized. If so, let it proceed.
    if (isPathLocalized(pathname)) {
        return NextResponse.next();
    }
    
    // 2. If no locale is found, determine the user's preferred locale
    const locale = getLocale(request);

    // 3. Redirect the user to the correct localized URL (e.g., '/' to '/en')
    const url = request.nextUrl.clone();
    
    const newPath = `/${locale}${pathname}`;

    url.pathname = newPath.replace(/\/+/g, '/'); // Clean up any potential double slashes

    // Perform an external REDIRECT to change the client's visible URL
    return NextResponse.redirect(url);
}

export const config = {
    // Matcher should skip API routes, next assets, and already localized paths
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|logo.png|en|es|images).*)'],
};