import { defineStore } from 'pinia'
import { useSessionStorage } from '@vueuse/core'

export const useOrganizationStore = defineStore('organization', () => {
  const selectedBranchId = useSessionStorage<number | null>('ftf:v3:branch', null, {
    serializer: {
      read(value) {
        const id = Number(value)
        return Number.isSafeInteger(id) && id > 0 ? id : null
      },
      write: String,
    },
  })
  function selectBranch(id: number | null) {
    selectedBranchId.value = id
  }
  return { selectedBranchId, selectBranch }
})
