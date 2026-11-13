import { computed } from 'vue'
import { z } from 'zod'
import { useQuery } from '@tanstack/vue-query'
import { useNow, useIntervalFn } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useSession } from '@/composables/auth/useSession'
import { useOrganization } from '@/composables/organization/useOrganization'
import { categoriesQuery, productsQuery } from '@/queries/catalog'
import { decimalSchema } from '@/types/catalog'

export function useCatalog(listing = true) {
  const auth = useAuthStore()
  const { homeCompany } = useSession()
  const { ready, company, isParent } = useOrganization()
  const products = useQuery(
    computed(() => ({
      ...productsQuery(auth.token, auth.revision),
      enabled: ready.value && listing,
    })),
  )
  const categories = useQuery(
    computed(() => ({
      ...categoriesQuery(auth.token, auth.revision),
      enabled: ready.value && listing,
    })),
  )
  const pricing = computed(() => {
    // Acting-branch markup cannot be applied to home-company catalog prices.
    const source =
      !isParent.value && company.data.value?.id === homeCompany.value?.id
        ? company.data.value
        : null
    const result = z
      .object({ options: z.object({ group_pricing: decimalSchema.nullish() }).nullish() })
      .safeParse(source?.customer_group)
    return {
      homeCompanyId: homeCompany.value?.id ?? 0,
      groupMarkup: result.success ? (result.data.options?.group_pricing ?? 0) : 0,
    }
  })
  const now = useNow({ scheduler: (update) => useIntervalFn(update, 1000) })
  return { products, categories, pricing, now, ready }
}
