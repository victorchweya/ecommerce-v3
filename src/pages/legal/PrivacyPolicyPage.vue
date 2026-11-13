<script setup lang="ts">
import InformationPage from '@/components/shared/InformationPage.vue'
import blocks from '@/content/legal/privacy'
</script>
<template>
  <InformationPage title="Privacy policy"
    ><component
      :is="block.tag"
      v-for="(block, index) in blocks"
      :key="index"
      :class="block.tag === 'h2' ? 'text-xl font-semibold' : 'leading-relaxed'"
      >{{ block.text }}</component
    ></InformationPage
  >
</template>
