<script setup lang="ts">
import Select from 'primevue/select'
import type { Category } from '@/types/catalog'
defineProps<{
  categories: Category[]
  grades: { id: number; name: string }[]
  categoryId: number | null
  gradeId: number | null
}>()
defineEmits<{
  category: [id: number | null]
  grade: [id: number | null]
}>()
</script>
<template>
  <div class="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:gap-4">
    <div class="flex min-w-0 flex-col gap-2 lg:w-60">
      <label id="category-label" for="category-filter" class="lg:sr-only">Category</label>
      <Select
        inputId="category-filter"
        name="category"
        ariaLabelledby="category-label"
        :modelValue="categoryId"
        :options="[{ id: null, name: 'All categories' }, ...categories]"
        optionLabel="name"
        optionValue="id"
        placeholder="All categories"
        :showClear="categoryId !== null"
        labelClass="whitespace-normal"
        class="w-full"
        @update:model-value="$emit('category', $event)"
      />
    </div>
    <div class="flex min-w-0 flex-col gap-2 lg:w-40">
      <label id="grade-filter-label" for="grade-filter" class="lg:sr-only">Grade</label>
      <Select
        inputId="grade-filter"
        name="grade"
        ariaLabelledby="grade-filter-label"
        :modelValue="gradeId"
        :options="[{ id: null, name: 'All grades' }, ...grades]"
        optionLabel="name"
        optionValue="id"
        placeholder="All grades"
        :showClear="gradeId !== null"
        class="w-full"
        @update:model-value="$emit('grade', $event)"
      />
    </div>
  </div>
</template>
