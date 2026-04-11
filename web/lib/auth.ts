export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Try localStorage first (most reliable)
  const localToken = localStorage.getItem('prosite_token');
  if (localToken) return localToken;
  // Try cookie — split carefully since JWT values contain '='
  for (const raw of document.cookie.split(';')) {
    const idx = raw.indexOf('=');
    if (idx === -1) continue;
    const name = raw.slice(0, idx).trim();
    const value = raw.slice(idx + 1).trim();
    if (name === 'prosite_token') return decodeURIComponent(value);
  }
  return null;
}

export function setToken(token: string) {
  localStorage.setItem('prosite_token', token);
  document.cookie = `prosite_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Strict`;
}

export function removeToken() {
  localStorage.removeItem('prosite_token');
  document.cookie = 'prosite_token=; path=/; max-age=0';
}
