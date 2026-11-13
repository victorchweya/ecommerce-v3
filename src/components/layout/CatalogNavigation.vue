<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useResizeObserver, useScroll } from '@vueuse/core'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import ChevronLeft from '@primeicons/vue/chevron-left'
import ChevronRight from '@primeicons/vue/chevron-right'
import { useAuthStore } from '@/stores/auth'
import { categoriesQuery } from '@/queries/catalog'
const props = defineProps<{ ready: boolean; vertical?: boolean }>()
const auth = useAuthStore()
const route = useRoute()
const categories = useQuery(
  computed(() => ({ ...categoriesQuery(auth.token, auth.revision), enabled: props.ready })),
)
const scroller = useTemplateRef<HTMLElement>('category-scroller')
const { arrivedState, measure } = useScroll(scroller, { observe: true })
useResizeObserver(scroller, measure)
function scroll(direction: number) {
  const width = scroller.value?.parentElement?.clientWidth ?? 0
  scroller.value?.scrollBy({ left: direction * width * 0.75 })
}
</script>
<template>
  <div :data-vertical="vertical || undefined" :class="vertical ? '' : 'flex min-w-0 items-center'">
    <Button
      v-if="!vertical && !arrivedState.left"
      type="button"
      aria-label="Scroll categories left"
      severity="secondary"
      variant="text"
      class="size-11 shrink-0"
      @click="scroll(-1)"
      ><ChevronLeft aria-hidden="true"
    /></Button>
    <div
      ref="category-scroller"
      :class="
        vertical
          ? 'flex flex-col'
          : 'flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      "
    >
      <RouterLink
        to="/catalog"
        class="category-link"
        :aria-current="route.name === 'catalog' ? 'page' : undefined"
        >All products</RouterLink
      >
      <RouterLink
        v-for="category in categories.data.value"
        :key="category.id"
        :to="{ name: 'category', params: { categoryId: category.id } }"
        class="category-link"
        :aria-current="
          route.name === 'category' && String(route.params.categoryId) === String(category.id)
            ? 'page'
            : undefined
        "
        >{{ category.name }}</RouterLink
      >
    </div>
    <Button
      v-if="!vertical && (!arrivedState.left || !arrivedState.right)"
      type="button"
      aria-label="Scroll categories right"
      severity="secondary"
      variant="text"
      :disabled="arrivedState.right"
      class="size-11 shrink-0"
      @click="scroll(1)"
      ><ChevronRight aria-hidden="true"
    /></Button>
  </div>
</template>
<style scoped>
@reference "../../assets/styles/main.css";
.category-link {
  @apply flex min-h-13 shrink-0 items-center border-b-2 border-transparent px-4 text-muted-color whitespace-nowrap hover:text-color;
}
[data-vertical] .category-link {
  white-space: normal;
}
.category-link:focus-visible {
  outline-offset: -4px;
}
.category-link[aria-current='page'] {
  @apply border-primary text-primary;
}
</style>
