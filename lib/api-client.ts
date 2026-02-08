/**
 * Unified API client for authenticated fetch requests
 * 
 * This module provides a consistent way to make authenticated API calls
 * from both client and server components:
 * - Client-side: reads token from localStorage
 * - Server-side: reads token from cookies
 * - Automatically redirects to /login?returnUrl= on 401 responses
 */

/**
 * Check if code is running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Get the authentication token from the appropriate source
 * - Client: localStorage
 * - Server: cookies (via request parameter)
 */
function getAuthToken(cookies?: string): string | null {
  if (isBrowser()) {
    // Client-side: read from localStorage
    return localStorage.getItem('authToken')
  } else {
    // Server-side: parse from cookies string
    if (!cookies) return null
    
    const cookiePairs = cookies.split(';').map(c => c.trim())
    const tokenCookie = cookiePairs.find(c => 
      c.startsWith('token=') || c.startsWith('authToken=')
    )
    
    if (tokenCookie) {
      return tokenCookie.split('=')[1]
    }
    
    return null
  }
}

/**
 * Handle 401 Unauthorized responses
 * Redirects to login page with return URL on client-side
 */
function handle401Error(): never {
  if (isBrowser()) {
    // Clear invalid token
    localStorage.removeItem('authToken')
    
    // Get current path for return URL
    const currentPath = window.location.pathname + window.location.search
    const returnUrl = encodeURIComponent(currentPath)
    
    // Redirect to login
    window.location.href = `/login?returnUrl=${returnUrl}`
  }
  
  throw new Error('Unauthorized')
}

/**
 * Options for authenticated fetch requests
 */
export interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
  cookies?: string // Server-side only: pass cookies from request
}

/**
 * Make an authenticated API request
 * 
 * This function automatically:
 * - Attaches Authorization header with token from localStorage (client) or cookies (server)
 * - Handles 401 responses by redirecting to login (client-side)
 * - Preserves other fetch options and headers
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Response from the API
 * 
 * @example
 * // Client-side usage
 * const data = await apiFetch('/api/projects').then(r => r.json())
 * 
 * @example
 * // Server-side usage
 * const data = await apiFetch('/api/projects', {
 *   cookies: request.headers.get('cookie') || ''
 * }).then(r => r.json())
 */
export async function apiFetch(
  url: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const { cookies, headers = {}, ...fetchOptions } = options
  
  // Get token from appropriate source
  const token = getAuthToken(cookies)
  
  // Build headers
  const finalHeaders: Record<string, string> = {
    ...headers,
  }
  
  // Add Authorization header if token exists
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`
  }
  
  // Make the request
  const response = await fetch(url, {
    ...fetchOptions,
    headers: finalHeaders,
  })
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    handle401Error()
  }
  
  return response
}

/**
 * Make an authenticated API request from client-side code
 * This is a convenience wrapper that explicitly indicates client-side usage
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options (excluding cookies)
 * @returns Response from the API
 */
export async function clientFetch(
  url: string,
  options: Omit<ApiFetchOptions, 'cookies'> = {}
): Promise<Response> {
  return apiFetch(url, options)
}

/**
 * Make an authenticated API request from server-side code
 * Requires cookies to be passed from the request
 * 
 * @param url - API endpoint URL
 * @param cookies - Cookie string from request headers
 * @param options - Fetch options
 * @returns Response from the API
 */
export async function serverFetch(
  url: string,
  cookies: string,
  options: Omit<ApiFetchOptions, 'cookies'> = {}
): Promise<Response> {
  return apiFetch(url, { ...options, cookies })
}
