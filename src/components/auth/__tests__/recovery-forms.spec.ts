import { afterEach, expect, it } from 'vitest'
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import ForgotPasswordForm from '../ForgotPasswordForm.vue'
import ResetPasswordForm from '../ResetPasswordForm.vue'

enableAutoUnmount(afterEach)
const global = { plugins: [PrimeVue] }
it('keeps the entered email when loading and server feedback update', async () => {
  const wrapper = mount(ForgotPasswordForm, { props: { pending: false, error: '' }, global })
  await flushPromises()
  await wrapper.get('#recovery-email').setValue('customer@example.test')
  await wrapper.setProps({ pending: true })
  await wrapper.setProps({ pending: false, error: 'Please try again.' })
  await flushPromises()
  expect((wrapper.get('#recovery-email').element as HTMLInputElement).value).toBe(
    'customer@example.test',
  )
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  expect(wrapper.emitted('submit')).toEqual([['customer@example.test']])
})
it('keeps the reset values when a server error appears and resubmits the same contract', async () => {
  const wrapper = mount(ResetPasswordForm, {
    props: {
      pending: false,
      error: '',
      email: 'customer@example.test',
      token: 'test-reset-token',
      fieldErrors: {},
    },
    global,
  })
  await flushPromises()
  await wrapper.get('#reset-password').setValue('new-password')
  await wrapper.get('#confirm-password').setValue('new-password')
  await wrapper.setProps({ pending: true })
  await wrapper.setProps({
    pending: false,
    error: 'Please try again.',
    fieldErrors: { token: ['Reset token expired.'] },
  })
  await flushPromises()
  expect(wrapper.text()).toContain('Reset token expired.')
  expect((wrapper.get('#reset-password').element as HTMLInputElement).value).toBe('new-password')
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  expect(wrapper.emitted('submit')).toEqual([
    [
      {
        email: 'customer@example.test',
        token: 'test-reset-token',
        password: 'new-password',
        password_confirmation: 'new-password',
      },
    ],
  ])
})
