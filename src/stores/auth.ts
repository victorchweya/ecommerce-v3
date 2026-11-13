import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSessionStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', () => {
  const token = useSessionStorage('ftf:v3:token', '')
  const revision = ref(0)
  const notice = ref('')
  function setToken(value: string) {
    revision.value++
    token.value = value
  }
  return { token, revision, notice, setToken }
})
