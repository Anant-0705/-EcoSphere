export type AppRole = "ADMIN" | "MANAGER" | "AUDITOR" | "EMPLOYEE"

export function isAdmin(role?: string | null) {
  return role === "ADMIN"
}

export function isManager(role?: string | null) {
  return role === "ADMIN" || role === "MANAGER"
}

export function isAuditor(role?: string | null) {
  return role === "ADMIN" || role === "AUDITOR"
}

/** Org-wide dashboard / reports (not pure employee-only). */
export function canViewOrgReports(role?: string | null) {
  return role === "ADMIN" || role === "MANAGER" || role === "AUDITOR"
}

export function canIngest(role?: string | null) {
  return isManager(role)
}

export function canApprove(role?: string | null) {
  return isManager(role)
}

export function canManageUsers(role?: string | null) {
  return isAdmin(role)
}

export function canPublishPolicy(role?: string | null) {
  return isAdmin(role)
}

export function canManageEmissionFactors(role?: string | null) {
  return isAdmin(role)
}
