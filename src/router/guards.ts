import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import { watch } from 'vue'
import { queryClient } from '@/lib/query-client'
import { ApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { profileQuery } from '@/queries/auth'
import { branchesQuery } from '@/queries/organization'
import { accountAccess, safeReturnTo, isPublicRoute } from '@/utils/auth'
import { replaceSession } from '@/composables/auth/session'

export function installAuthGuards(router: Router, pinia: Pinia) {
  const auth = useAuthStore(pinia)
  const organization = useOrganizationStore(pinia)
  let pendingGuards = 0
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (
      !auth.token ||
      event.type !== 'updated' ||
      event.query.meta?.sessionRevision !== auth.revision
    )
      return
    const current = router.currentRoute.value
    if (event.action.type === 'error' && event.query.state.error instanceof ApiError) {
      if (event.query.state.error.status === 401) {
        if (pendingGuards && ['profile', 'branches'].includes(String(event.query.queryKey[2])))
          return
        replaceSession('')
        auth.notice = 'Your session expired. Please sign in again.'
        if (!current.meta.passwordRecovery && !isPublicRoute(current))
          void router.replace({
            name: 'login',
            query: { returnTo: safeReturnTo(current.fullPath) },
          })
      } else if (
        !pendingGuards &&
        !isPublicRoute(current) &&
        event.query.state.error.status === 403 &&
        event.query.queryKey[2] === 'profile'
      ) {
        void router.replace({ name: 'accessDenied' })
      }
      return
    }
    if (
      pendingGuards ||
      event.action.type !== 'success' ||
      !current.name ||
      current.meta.guestOnly ||
      current.meta.passwordRecovery ||
      isPublicRoute(current)
    )
      return
    if (event.query.queryKey[2] === 'profile') {
      const profile = queryClient.getQueryData(profileQuery(auth.token, auth.revision).queryKey)
      if (!profile) return
      const access = accountAccess(profile)
      if (
        access === 'pending' &&
        current.name !== 'accountPendingApproval' &&
        !current.meta.onboarding
      )
        void router.replace({ name: 'accountPendingApproval' })
      if (access === 'denied' && current.name !== 'accessDenied')
        void router.replace({ name: 'accessDenied' })
    }
    if (event.query.queryKey[2] === 'branches') {
      const branches = queryClient.getQueryData(branchesQuery(auth.token, auth.revision).queryKey)
      if (
        organization.selectedBranchId &&
        !branches?.some((branch) => branch.id === organization.selectedBranchId)
      ) {
        void queryClient.cancelQueries({ queryKey: ['branch'] })
        queryClient.removeQueries({ queryKey: ['branch'] })
        organization.selectBranch(null)
        void router.replace({ name: 'parentAccount' })
      }
    }
  })
  const stop = watch(
    () => auth.token,
    (token) => {
      if (!token) {
        queryClient.clear()
        organization.selectBranch(null)
      }
    },
    { flush: 'sync' },
  )
  const removeGuard = router.beforeEach(async (to) => {
    if (
      typeof to.params.id === 'string' &&
      (!Number.isSafeInteger(Number(to.params.id)) || Number(to.params.id) <= 0)
    )
      return {
        name: 'notFound',
        params: { pathMatch: to.path.slice(1).split('/') },
        query: to.query,
        hash: to.hash,
      }

    if (isPublicRoute(to)) return
    if (!auth.token) {
      if (to.meta.requiresAuth || to.meta.approvalOnly)
        return { name: 'login', query: { returnTo: safeReturnTo(to.fullPath) } }
      return
    }
    if (
      to.name === 'error' ||
      to.name === 'accessDenied' ||
      to.name === 'notFound' ||
      to.meta.passwordRecovery
    )
      return
    const revision = auth.revision
    pendingGuards++
    try {
      const profile = await queryClient.fetchQuery(profileQuery(auth.token, revision))
      if (revision !== auth.revision) return false
      const access = accountAccess(profile)
      if (access === 'pending')
        return to.meta.approvalOnly || to.meta.onboarding
          ? undefined
          : { name: 'accountPendingApproval' }
      if (access === 'denied') return { name: 'accessDenied' }
      const parent = profile.customer?.company?.organisation_structure === 'parent_organisation'
      if (parent) {
        try {
          const branches = await queryClient.fetchQuery(branchesQuery(auth.token, revision))
          if (revision !== auth.revision) return false
          if (!branches.some((branch) => branch.id === organization.selectedBranchId))
            organization.selectBranch(null)
        } catch (error) {
          if (error instanceof ApiError && [401, 403].includes(error.status)) throw error
          organization.selectBranch(null)
          return to.name === 'parentAccount' ? undefined : { name: 'parentAccount' }
        }
        if (to.meta.requiresBranch && !organization.selectedBranchId)
          return { name: 'parentAccount', query: { returnTo: to.fullPath } }
      } else organization.selectBranch(null)
      if (to.meta.guestOnly || to.meta.approvalOnly || (to.name === 'parentAccount' && !parent))
        return { name: 'home' }
    } catch (error) {
      if (revision !== auth.revision) return false
      if (error instanceof ApiError && error.status === 401) {
        replaceSession('')
        auth.notice = 'Your session expired. Please sign in again.'
        return { name: 'login', query: { returnTo: safeReturnTo(to.fullPath) } }
      }
      return { name: error instanceof ApiError && error.status === 403 ? 'accessDenied' : 'error' }
    } finally {
      pendingGuards--
    }
  })
  return () => {
    unsubscribe()
    stop()
    removeGuard()
  }
}
