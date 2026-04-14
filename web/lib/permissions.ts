// Maps route prefix → roles that can see it in the sidebar
export const ROUTE_ROLES: Record<string, string[]> = {
  '/dashboard':       ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER', 'PROJECT_MANAGER', 'FIELD_TECH'],
  '/schedule':        ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER', 'PROJECT_MANAGER', 'FIELD_TECH'],
  '/tasks':           ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER', 'PROJECT_MANAGER', 'FIELD_TECH'],
  '/clients':         ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER'],
  '/quotes':          ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER'],
  '/leads':           ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER'],
  '/projects':        ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER', 'PROJECT_MANAGER'],
  '/change-orders':   ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER', 'PROJECT_MANAGER'],
  '/invoices':        ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER'],
  '/subcontractors':  ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'],
  '/reports':         ['SUPER_ADMIN', 'ADMIN', 'OFFICE_MANAGER'],
  '/team':            ['SUPER_ADMIN', 'ADMIN'],
  '/settings':        ['SUPER_ADMIN', 'ADMIN'],
  '/promo':           ['SUPER_ADMIN'],
};

export function canSeeRoute(role: string, href: string): boolean {
  const key = Object.keys(ROUTE_ROLES).find(k => href === k || href.startsWith(k + '/'));
  if (!key) return false;
  return ROUTE_ROLES[key].includes(role);
}

// Keep legacy export so nothing else breaks
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['*'],
  OFFICE_MANAGER: ['/dashboard', '/clients', '/quotes', '/leads', '/projects', '/invoices', '/reports', '/schedule', '/tasks'],
  PROJECT_MANAGER: ['/dashboard', '/projects', '/change-orders', '/subcontractors', '/schedule', '/tasks'],
  FIELD_TECH: ['/dashboard', '/schedule', '/tasks'],
  SUBCONTRACTOR: ['/projects'],
};

export function canAccess(role: string, pathname: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.some(p => pathname === p || pathname.startsWith(p + '/'));
}
