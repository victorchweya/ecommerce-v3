import type { RouteLocationNormalized } from 'vue-router'
import { ApiError } from '@/lib/api'
import type { Profile } from '@/types/auth'

export function accountAccess(profile: Profile): 'active' | 'pending' | 'denied' {
  if (['inactive', 'suspended'].includes(profile.status?.toLowerCase() ?? '')) return 'denied'
  const company = profile.customer?.company
  // Existing parent-account flow uses organisation structure, independently of company status.
  if (company?.organisation_structure === 'parent_organisation') return 'active'
  if (company?.status === 'active') return 'active'
  return company?.status === 'pending' ? 'pending' : 'denied'
}
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name))
    return 'The request timed out. Please try again.'
  return 'We could not complete the request. Please try again.'
}
export function safeReturnTo(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u0020]/.test(value)
  )
    return '/'
  const path = value.split(/[?#]/)[0] ?? '/'
  const setupPaths = ['/auth/contact-person', '/auth/billing-details', '/auth/delivery-address']
  if (
    (path.startsWith('/auth/') && !setupPaths.includes(path)) ||
    ['/error', '/access-denied'].includes(path)
  )
    return '/'
  return value
}

export const apiFieldErrors = (error: unknown): Record<string, string[]> =>
  error instanceof ApiError ? error.fieldErrors : {}

export function isPublicRoute(route: Pick<RouteLocationNormalized, 'meta' | 'query'>) {
  return Boolean(
    route.meta.publicPage ||
    (route.meta.signedDocument &&
      typeof route.query.signature === 'string' &&
      route.query.signature),
  )
}
