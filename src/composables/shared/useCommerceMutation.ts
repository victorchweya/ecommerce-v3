import { computed, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/lib/api'
import { errorMessage, safeReturnTo, isPublicRoute } from '@/utils/auth'
import { replaceSession } from '@/composables/auth/session'
import { useCommerceContext } from './useCommerceContext'
import type { CommerceTarget } from '@/queries/context'
export function useCommerceMutation<Input, Output>(
  action: (target: CommerceTarget, input: Input) => Promise<Output>,
  onSaved?: (output: Output) => void | Promise<void>,
  home = false,
) {
  const context = useCommerceContext()
  const client = useQueryClient()
  const route = useRoute()
  const router = useRouter()
  const mutation = useMutation({
    mutationFn: ({ target, input }: { target: CommerceTarget; input: Input }) =>
      action(target, input),
    async onSuccess(output, { target }) {
      if (context.auth.revision !== target.revision) return
      await client.invalidateQueries({
        queryKey: home
          ? ['session', target.revision]
          : ['branch', target.revision, target.branchId],
      })
      if (context.current(target)) await onSaved?.(output)
    },
    onError(error, { target }) {
      if (
        context.auth.revision === target.revision &&
        error instanceof ApiError &&
        error.status === 401
      ) {
        const returnTo = safeReturnTo(route.fullPath)
        replaceSession('')
        context.auth.notice = 'Your session expired. Please sign in again.'
        if (!route.meta.passwordRecovery && !isPublicRoute(route))
          void router.replace({ name: 'login', query: { returnTo } })
      }
    },
  })
  watch(context.key, () => mutation.reset(), { flush: 'sync' })
  function save(input: Input) {
    if (!context.ready.value || mutation.isPending.value) return
    mutation.mutate({ target: context.target(), input })
  }
  const feedback = computed(() => ({
    pending: mutation.isPending.value,
    error: mutation.error.value ? errorMessage(mutation.error.value) : '',
    fieldErrors: mutation.error.value instanceof ApiError ? mutation.error.value.fieldErrors : {},
  }))
  return { ...context, mutation, feedback, save }
}
