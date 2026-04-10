export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'],
  OFFICE_MANAGER: ['/dashboard', '/clients', '/quotes', '/projects', '/invoices', '/reports', '/schedule'],
  PROJECT_MANAGER: ['/dashboard', '/projects', '/change-orders', '/subcontractors', '/schedule'],
  FIELD_TECH: ['/dashboard', '/schedule'],
  SUBCONTRACTOR: ['/projects'],
};

export function canAccess(role: string, pathname: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.some(p => pathname === p || pathname.startsWith(p + '/'));
}
