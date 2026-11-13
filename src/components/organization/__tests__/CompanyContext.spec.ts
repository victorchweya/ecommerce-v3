import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { shallowRef, nextTick } from 'vue'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import CompanyContext from '../CompanyContext.vue'
const mockOrganization = vi.hoisted(() => vi.fn())
vi.mock('@/composables/organization/useOrganization', () => ({ useOrganization: mockOrganization }))
enableAutoUnmount(afterEach)
let context: ReturnType<typeof state>
function state() {
  return {
    company: {
      data: shallowRef({ id: 11, name: 'West branch' }),
      isFetching: shallowRef(false),
      refetch: vi.fn(),
    },
    ready: shallowRef(true),
    companyError: shallowRef(''),
    isParent: shallowRef(false),
    selectedBranch: shallowRef<{ id: number; name: string } | undefined>(),
  }
}
beforeEach(() => {
  context = state()
  mockOrganization.mockReturnValue(context)
})
const render = () => mount(CompanyContext, { global: { plugins: [PrimeVue] } })
it('shows the context only for a parent shopping through a matching selected branch', async () => {
  const wrapper = render()
  expect(wrapper.text()).toBe('')
  context.isParent.value = true
  await nextTick()
  expect(wrapper.text()).toBe('')
  context.selectedBranch.value = { id: 11, name: 'West branch' }
  await nextTick()
  expect(wrapper.text()).toBe('Shopping for West branch.')
  context.selectedBranch.value = { id: 22, name: 'East branch' }
  await nextTick()
  expect(wrapper.text()).toBe('')
  context.company.data.value = { id: 22, name: 'East branch' }
  await nextTick()
  expect(wrapper.text()).toBe('Shopping for East branch.')
  context.ready.value = false
  await nextTick()
  expect(wrapper.text()).toBe('')
})
it('retains loading and retry feedback for independent customers', async () => {
  context.company.isFetching.value = true
  const wrapper = render()
  expect(wrapper.text()).toContain('Loading company details…')
  context.company.isFetching.value = false
  context.companyError.value = 'Company unavailable.'
  await nextTick()
  expect(wrapper.text()).toContain('Company unavailable.')
  await wrapper.get('button').trigger('click')
  expect(context.company.refetch).toHaveBeenCalledOnce()
  expect(wrapper.text()).not.toContain('Shopping for')
})
