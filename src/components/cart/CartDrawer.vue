<script setup lang="ts">
import Drawer from 'primevue/drawer'
import CartPreview from './CartPreview.vue'
defineEmits<{ afterHide: [] }>()
const visible = defineModel<boolean>('visible', { required: true })
</script>
<template>
  <Drawer
    v-model:visible="visible"
    @after-hide="$emit('afterHide')"
    id="cart-drawer"
    header="Your cart"
    aria-label="Your cart"
    position="right"
    class="w-full sm:w-[40rem]"
  >
    <CartPreview />
  </Drawer>
</template>
