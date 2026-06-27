import { getToken } from './auth';

// Treat empty / whitespace-only env value as missing, strip trailing slash.
const RAW = (process.env.NEXT_PUBLIC_API_URL || '').trim();
const API_BASE = (RAW || 'http://localhost:3002').replace(/\/+$/, '');

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  if (!token && typeof window !== 'undefined') {
    const pub = ['/login', '/register', '/home', '/'];
    if (!pub.includes(window.location.pathname)) {
      console.warn('[apiFetch] No auth token for', path, '— redirecting to login');
      window.location.href = '/login';
      throw new Error('No auth token');
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err: any) {
    // fetch throws TypeError ("Failed to fetch", "Load failed", "The string did not
    // match the expected pattern") for malformed URLs, mixed-content blocks, CORS
    // preflight failures, or network drops. Log the constructed URL so the cause
    // is visible instead of just a cryptic TypeError.
    console.error('[apiFetch] fetch failed', { url, path, apiBase: API_BASE, error: err?.message });
    throw new Error(`Network error contacting API (${url}): ${err?.message || 'unknown'}`);
  }

  if (res.status === 401) {
    console.error('[apiFetch] 401 Unauthorized for', path, '— clearing token and redirecting');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prosite_token');
      document.cookie = 'prosite_token=; path=/; max-age=0';
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  return res;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
