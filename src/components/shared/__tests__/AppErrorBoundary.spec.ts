import { defineComponent, h, nextTick, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import AppErrorBoundary from '../AppErrorBoundary.vue'

it('shows recovery content after a render error and recovers when navigation changes', async () => {
  const report = vi.spyOn(console, 'error').mockImplementation(() => {})
  const broken = shallowRef(true)
  const Child = defineComponent({
    setup: () => () => {
      if (broken.value) throw new Error('Page failed')
      return h('p', 'Page recovered')
    },
  })
  const wrapper = mount(AppErrorBoundary, {
    props: { resetKey: '/broken' },
    slots: { default: () => h(Child), fallback: () => h('p', 'Recovery available') },
  })
  await nextTick()
  expect(wrapper.text()).toBe('Recovery available')
  expect(report).toHaveBeenCalledWith('Unhandled view error:', expect.any(Error))

  broken.value = false
  await wrapper.setProps({ resetKey: '/' })
  expect(wrapper.text()).toBe('Page recovered')
  wrapper.unmount()
})
