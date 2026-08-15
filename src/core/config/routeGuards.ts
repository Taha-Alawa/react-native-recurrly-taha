import type { AppRole } from "@/core/store/authStore";

/**
 * Route permissions as data, not scattered conditionals (architecture §11).
 *
 * React Native has no edge middleware, so the resolver below is consumed by the
 * authenticated layout instead of by a server-side matcher. The shape is
 * identical: path -> allowed roles, resolved by longest-prefix match so a nested
 * route can tighten what its parent allows.
 */
export const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  "/": ["user", "admin"],
  "/subscriptions": ["user", "admin"],
  "/insights": ["user", "admin"],
  "/settings": ["user", "admin"],
};

export const resolveAllowedRoles = (pathname: string): AppRole[] => {
  const match = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  return match ? ROUTE_PERMISSIONS[match] : ["user", "admin"];
};

export const canAccess = (pathname: string, role: AppRole): boolean =>
  resolveAllowedRoles(pathname).includes(role);
