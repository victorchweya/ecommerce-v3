<script setup lang="ts">
import { computed } from 'vue'
import { useCart } from '@/composables/cart/useCart'
import { additionIssue } from '@/validation/cart'
import { useQuery } from '@tanstack/vue-query'
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import Heart from '@primeicons/vue/heart'
import HeartFill from '@primeicons/vue/heart-fill'
import PageBreadcrumb from '@/components/shared/PageBreadcrumb.vue'
import Message from 'primevue/message'
import { useCatalog } from '@/composables/catalog/useCatalog'
import { useFavourites } from '@/composables/catalog/useFavourites'
import { routeId } from '@/composables/catalog/useCatalogFilters'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { productQuery } from '@/queries/catalog'
import { ApiError } from '@/lib/api'
import { errorMessage } from '@/utils/auth'
import { isVisibleProduct, productImage } from '@/utils/catalog/search'
import CompanyContext from '@/components/organization/CompanyContext.vue'
import ProductConfigurator from './ProductConfigurator.vue'
import ProductImage from './ProductImage.vue'
const props = defineProps<{ productId: string }>()
const auth = useAuthStore()
const organization = useOrganizationStore()
const { ready, pricing, now } = useCatalog(false)
const { cart, add, ready: cartReady } = useCart(false)
const id = computed(() => routeId(props.productId))
const query = useQuery(
  computed(() => ({
    ...productQuery(auth.token, auth.revision, id.value ?? 0),
    enabled: ready.value && id.value !== null,
  })),
)
const product = computed(() =>
  query.data.value && isVisibleProduct(query.data.value) ? query.data.value : null,
)
const missing = computed(
  () =>
    !id.value ||
    (query.error.value instanceof ApiError && query.error.value.status === 404) ||
    (query.isSuccess.value && !product.value),
)
const favourites = useFavourites(() => ready.value)
const isFavourite = computed(
  () => product.value !== null && favourites.ids.value.has(product.value.id),
)
const favouriteDisabled = computed(
  () =>
    !favourites.query.isSuccess.value || favourites.query.isError.value || favourites.busy.value,
)
</script>
<template>
  <section class="flex flex-col gap-5" aria-labelledby="product-heading">
    <PageBreadcrumb
      :items="[
        { label: 'Catalog', to: '/catalog' },
        ...(product?.category
          ? [{ label: product.category.name, to: `/catalog/category/${product.category.id}` }]
          : []),
        { label: product?.name ?? 'Product details' },
      ]"
    />
    <CompanyContext />
    <template v-if="ready">
      <template v-if="missing">
        <h1 id="product-heading" class="text-2xl font-semibold">Product unavailable</h1>
        <p>This product could not be found or is no longer available.</p>
      </template>
      <template v-else-if="query.isError.value">
        <h1 id="product-heading" class="text-2xl font-semibold">Product details</h1>
        <Message severity="error">{{ errorMessage(query.error.value) }}</Message>
        <Button
          label="Retry product"
          severity="secondary"
          class="self-start"
          :disabled="query.isFetching.value"
          @click="query.refetch()"
        />
      </template>
      <p v-else-if="query.isPending.value" role="status">Loading product…</p>
      <template v-else-if="product">
        <Message v-if="cart.error" severity="error">{{ cart.error }}</Message>
        <p v-if="cart.notice" role="status">
          {{ cart.notice }}
          <RouterLink :to="{ name: 'cart' }" class="underline">View cart</RouterLink>
        </p>
        <Message v-if="additionIssue(product, now.getTime())" severity="info">{{
          additionIssue(product, now.getTime())
        }}</Message>
        <div class="grid items-start gap-6 md:grid-cols-2">
          <ProductImage :src="productImage(product)" :name="product.name" />
          <div class="flex min-w-0 flex-col gap-5">
            <h1 id="product-heading" class="text-2xl font-semibold">{{ product.name }}</h1>
            <RouterLink
              v-if="product.category"
              :to="{ name: 'category', params: { categoryId: product.category.id } }"
              class="self-start underline"
              >{{ product.category.name }}</RouterLink
            >
            <template v-if="favourites.query.isError.value">
              <Message severity="warn">Favourites could not be loaded.</Message>
              <Button
                label="Retry favourites"
                severity="secondary"
                class="self-start"
                :disabled="favourites.query.isFetching.value"
                @click="favourites.query.refetch()"
              />
            </template>
            <Message v-if="favourites.mutation.isError.value" severity="error">{{
              errorMessage(favourites.mutation.error.value)
            }}</Message>
            <Button
              :aria-label="`${isFavourite ? 'Remove' : 'Save'} ${product.name} ${isFavourite ? 'from' : 'to'} favourites`"
              :aria-pressed="isFavourite"
              severity="secondary"
              variant="text"
              class="self-start"
              :disabled="favouriteDisabled"
              @click="favourites.toggle(product.id)"
              ><HeartFill v-if="isFavourite" aria-hidden="true" class="text-primary" />
              <Heart v-else aria-hidden="true" />{{
                isFavourite ? 'Saved to favourites' : 'Save to favourites'
              }}</Button
            >
            <ProductConfigurator
              :key="`${auth.revision}:${organization.selectedBranchId}:${product.id}`"
              :product="product"
              :pricing="pricing"
              :now="now.getTime()"
              action-label="Add to cart"
              :disabled="
                !cartReady || cart.needsRecovery || Boolean(additionIssue(product, now.getTime()))
              "
              @confirm="add($event, product)"
            />
          </div>
        </div>
      </template>
    </template>
  </section>
</template>
