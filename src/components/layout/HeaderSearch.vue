<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Search from '@primeicons/vue/search'
const route = useRoute()
const router = useRouter()
const draft = shallowRef('')
const browsing = computed(() => ['catalog', 'category', 'favourites'].includes(String(route.name)))
watch(
  () => route.query.q,
  (value) => {
    draft.value = typeof value === 'string' ? value : ''
  },
  { immediate: true },
)
function update(value: string | undefined) {
  draft.value = value ?? ''
  if (browsing.value)
    void router.replace({ query: { ...route.query, page: undefined, q: draft.value || undefined } })
}
function search() {
  void router.push(
    browsing.value
      ? {
          path: route.path,
          query: { ...route.query, page: undefined, q: draft.value || undefined },
        }
      : { name: 'catalog', query: { q: draft.value || undefined } },
  )
}
</script>
<template>
  <form role="search" class="min-w-0" @submit.prevent="search">
    <label for="catalog-search" class="sr-only">Search products</label>
    <IconField>
      <InputIcon><Search /></InputIcon>
      <InputText
        id="catalog-search"
        name="q"
        :modelValue="draft"
        type="search"
        enterkeyhint="search"
        placeholder="Search products or categories"
        class="h-12 w-full min-w-0"
        @update:model-value="update"
      />
    </IconField>
  </form>
</template>
