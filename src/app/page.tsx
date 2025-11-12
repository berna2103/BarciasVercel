// package/src/app/page.tsx

// All logic removed as the middleware handles the redirect

/**
 * This page exists only as a fallback for the root URL ('/').
 * The middleware.ts handles the automatic redirection to the localized path (e.g., /en).
 * Returning null ensures the middleware takes control without creating a conflict.
 */
export default function RootPage() {
  return null;
}