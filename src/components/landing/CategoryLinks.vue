<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ShoppingBag from '@primeicons/vue/shopping-bag'
import { useAuthStore } from '@/stores/auth'
import { useOrganization } from '@/composables/organization/useOrganization'
import { categoriesQuery } from '@/queries/catalog'
import { productImage } from '@/utils/catalog/search'
import type { Product } from '@/types/catalog'
import ProductImage from '@/components/catalog/ProductImage.vue'
const props = defineProps<{ products: Product[] }>()
const auth = useAuthStore()
const { ready } = useOrganization()
const categories = useQuery(
  computed(() => ({ ...categoriesQuery(auth.token, auth.revision), enabled: ready.value })),
)
const previews = computed(() =>
  (categories.data.value ?? []).slice(0, 6).map((category) => ({
    ...category,
    image:
      props.products
        .filter((product) => product.category?.id === category.id)
        .map(productImage)
        .find(Boolean) ?? null,
  })),
)
</script>
<template>
  <section
    v-if="previews.length || categories.isError.value"
    class="flex flex-col gap-6"
    aria-labelledby="category-links-heading"
  >
    <h2 id="category-links-heading" class="text-xl font-semibold">Shop by category</h2>
    <template v-if="categories.isError.value">
      <Message severity="warn"
        >Categories could not be loaded. You can still browse all products.</Message
      >
      <Button
        label="Retry categories"
        severity="secondary"
        class="self-start"
        :loading="categories.isFetching.value"
        @click="categories.refetch()"
      />
    </template>
    <ul
      v-else
      role="list"
      aria-label="Product categories"
      class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6"
    >
      <li v-for="category in previews" :key="category.id" class="min-w-0">
        <RouterLink
          :to="{ name: 'category', params: { categoryId: category.id } }"
          class="group flex flex-col gap-3"
        >
          <div aria-hidden="true">
            <ProductImage
              v-if="category.image"
              :src="category.image"
              :name="category.name"
              aspect="landscape"
            />
            <div
              v-else
              class="flex aspect-[4/3] items-center justify-center rounded-border bg-emphasis text-muted-color"
            >
              <ShoppingBag class="size-8" />
            </div>
          </div>
          <span class="group-hover:underline">{{ category.name }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
