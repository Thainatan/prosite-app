import { getToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  if (!token && typeof window !== 'undefined') {
    // Only redirect if we're in a protected route (not /login, /register, /home, /)
    const pub = ['/login', '/register', '/home', '/'];
    if (!pub.includes(window.location.pathname)) {
      console.warn('[apiFetch] No auth token for', path, '— redirecting to login');
      window.location.href = '/login';
      throw new Error('No auth token');
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

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
