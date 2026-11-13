import { useMutation } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { login, loginWithOtp } from '@/api/auth'
import type { LoginInput, OtpLoginInput } from '@/types/auth'
import { replaceSession } from './session'
import { safeReturnTo } from '@/utils/auth'
import { useAuthStore } from '@/stores/auth'

export function useLogin() {
  const router = useRouter()
  const route = useRoute()
  return useMutation({
    mutationFn: (input: LoginInput | OtpLoginInput) =>
      'otp_token' in input ? loginWithOtp(input) : login(input),
    async onSuccess(session) {
      useAuthStore().notice = ''
      replaceSession(session.token)
      await router.replace(safeReturnTo(route.query.returnTo))
    },
  })
}
