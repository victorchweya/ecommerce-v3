<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import Heart from '@primeicons/vue/heart'
import HeartFill from '@primeicons/vue/heart-fill'
import Tag from 'primevue/tag'
import type { Product } from '@/types/catalog'
import { productImage } from '@/utils/catalog/search'
import { unitPricing, type CatalogPricing } from '@/utils/catalog/pricing'
import { formatCurrency } from '@/lib/currency'
import ProductImage from './ProductImage.vue'
const props = defineProps<{
  product: Product
  pricing: CatalogPricing
  now: number
  favourite?: boolean
  favouriteDisabled?: boolean
  cartDialogId: string
  cartDialogOpen: boolean
}>()
defineEmits<{ favourite: [productId: number]; add: [event: Event] }>()
const image = computed(() => productImage(props.product))
const startingPrice = computed(
  () =>
    props.product.variations
      .filter((grade) => grade.status === 'active')
      .flatMap((grade) =>
        grade.unit_variants
          .filter((unit) => unit.status === 'active' && unit.unit)
          .flatMap((unit) => {
            const price = unitPricing(unit, props.pricing, props.now)
            return price
              ? [
                  {
                    amount: price.sale ?? price.regular,
                    unit: unit.unit?.name,
                    sale: price.sale !== null,
                  },
                ]
              : []
          }),
      )
      .sort((a, b) => a.amount - b.amount)[0],
)
</script>
<template>
  <article :aria-label="product.name" class="flex h-full min-w-0 flex-col gap-3">
    <div class="relative">
      <RouterLink
        :to="{ name: 'product', params: { productId: product.id } }"
        :aria-label="`View ${product.name}`"
        class="flex"
        ><ProductImage :src="image" :name="product.name" aspect="landscape" class="w-full"
      /></RouterLink>
      <Tag
        v-if="startingPrice?.sale"
        value="Sale"
        severity="secondary"
        class="absolute left-2 top-2"
      />
      <Button
        v-if="favourite !== undefined"
        :aria-label="`${favourite ? 'Remove' : 'Save'} ${product.name} ${favourite ? 'from' : 'to'} favourites`"
        :aria-pressed="favourite"
        severity="secondary"
        variant="text"
        :disabled="favouriteDisabled"
        class="absolute right-2 top-2 min-h-11 min-w-11 bg-surface-0 dark:bg-surface-950"
        @click="$emit('favourite', product.id)"
        ><HeartFill v-if="favourite" aria-hidden="true" class="text-primary" />
        <Heart v-else aria-hidden="true" />
      </Button>
    </div>
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <p v-if="product.category" class="text-sm text-muted-color">{{ product.category.name }}</p>
      <h2 class="min-h-14 text-lg font-semibold wrap-anywhere">
        <RouterLink
          :to="{ name: 'product', params: { productId: product.id } }"
          class="hover:underline"
          >{{ product.name }}</RouterLink
        >
      </h2>
      <p v-if="startingPrice" class="mt-auto tabular-nums">
        From {{ formatCurrency(startingPrice.amount) }} / {{ startingPrice.unit }}
      </p>
      <p v-else class="mt-auto text-muted-color">Currently unavailable</p>
    </div>
    <Button
      severity="secondary"
      variant="outlined"
      class="min-h-11 w-full"
      label="Add to cart"
      aria-haspopup="dialog"
      :aria-controls="cartDialogId"
      :aria-expanded="cartDialogOpen"
      :disabled="!startingPrice"
      @click="$emit('add', $event)"
    />
  </article>
</template>
