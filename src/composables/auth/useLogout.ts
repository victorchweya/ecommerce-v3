import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { replaceSession } from './session'

export function useLogout() {
  const auth = useAuthStore()
  const router = useRouter()
  const signingOut = ref(false)
  async function signOut() {
    if (signingOut.value) return
    signingOut.value = true
    const revision = auth.revision
    let failed = false
    try {
      await logout(auth.token)
    } catch {
      failed = true
    } finally {
      signingOut.value = false
      if (revision === auth.revision) {
        replaceSession('')
        auth.notice = failed ? 'You are signed out here. We could not confirm server sign-out.' : ''
        await router.replace({ name: 'login' })
      }
    }
  }
  return { signingOut, signOut }
}
