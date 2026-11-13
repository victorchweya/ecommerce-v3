import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { requestOtp } from '@/api/auth'
import type { OtpContact } from '@/types/auth'

export function useOtpChallenge() {
  const contact = ref<OtpContact>({})
  const challenge = useMutation({
    mutationFn: (value: string) =>
      requestOtp(value.includes('@') ? { email: value } : { phone: value }),
    onSuccess(_response, value) {
      contact.value = value.includes('@') ? { email: value } : { phone: value }
    },
  })
  function reset() {
    challenge.reset()
    contact.value = {}
  }
  return { contact, challenge, reset }
}
