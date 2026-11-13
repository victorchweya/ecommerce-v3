import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { queryClient } from '@/lib/query-client'
import { logout } from '@/api/auth'
import { useLogout } from '../useLogout'

const { replace } = vi.hoisted(() => ({ replace: vi.fn().mockResolvedValue(undefined) }))
vi.mock('vue-router', () => ({ useRouter: () => ({ replace }) }))
vi.mock('@/api/auth', () => ({ logout: vi.fn() }))
beforeEach(() => {
  sessionStorage.clear()
  setActivePinia(createPinia())
  queryClient.clear()
  vi.clearAllMocks()
})
it('clears token, branch, and private cached data after a failed server sign-out', async () => {
  const auth = useAuthStore()
  const organization = useOrganizationStore()
  auth.setToken('old-token')
  organization.selectBranch(11)
  queryClient.setQueryData(['branch', auth.revision, 11, 'company'], { name: 'Private company' })
  vi.mocked(logout).mockRejectedValueOnce(new Error('Offline'))
  await useLogout().signOut()
  expect(auth.token).toBe('')
  expect(organization.selectedBranchId).toBeNull()
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  expect(auth.notice).toContain('could not confirm server sign-out')
  expect(replace).toHaveBeenCalledWith({ name: 'login' })
})
it('does not clear a replacement session when an earlier sign-out finishes late', async () => {
  let release!: () => void
  vi.mocked(logout).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        release = () => resolve(undefined)
      }),
  )
  const auth = useAuthStore()
  auth.setToken('old-token')
  const { signOut, signingOut } = useLogout()
  const pending = signOut()
  auth.setToken('new-token')
  useOrganizationStore().selectBranch(22)
  release()
  await pending
  expect(auth.token).toBe('new-token')
  expect(useOrganizationStore().selectedBranchId).toBe(22)
  expect(signingOut.value).toBe(false)
  expect(replace).not.toHaveBeenCalled()
})
