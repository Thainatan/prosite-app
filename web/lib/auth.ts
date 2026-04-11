export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('prosite_token') ||
    document.cookie
      .split(';')
      .find(c => c.trim().startsWith('prosite_token='))
      ?.split('=')[1] ||
    null
  );
}

export function setToken(token: string) {
  localStorage.setItem('prosite_token', token);
  document.cookie = `prosite_token=${token}; path=/; max-age=86400; SameSite=Strict`;
}

export function removeToken() {
  localStorage.removeItem('prosite_token');
  document.cookie = 'prosite_token=; path=/; max-age=0';
}
