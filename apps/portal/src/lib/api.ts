
const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') 
  : '/backend';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  
  let headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  // If on server, we need to pass cookies manually
  if (typeof window === 'undefined') {
    try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
        headers['Cookie'] = allCookies;
    } catch (e) {
        console.warn("Failed to get cookies on server", e);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `API Error: ${response.status}`,
        message: errorData.message || `API Error: ${response.status}`
      } as unknown as T;
    }

    return response.json();
  } catch (err: any) {
    console.warn(`[API] Fetch failed for ${endpoint}:`, err.message);
    return { 
      success: false, 
      error: err.message || 'Network request failed',
      message: err.message || 'Network request failed'
    } as unknown as T;
  }
}

export const api = {
  get: <T>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body: any, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { 
        ...options, 
        method: 'POST', 
        body: body instanceof FormData ? body : JSON.stringify(body),
        headers: body instanceof FormData ? { ...options.headers } : { ...options.headers, 'Content-Type': 'application/json' }
    }),

  put: <T>(endpoint: string, body: any, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { 
        ...options, 
        method: 'PUT', 
        body: body instanceof FormData ? body : JSON.stringify(body),
        headers: body instanceof FormData ? { ...options.headers } : { ...options.headers, 'Content-Type': 'application/json' }
    }),

  delete: <T>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
