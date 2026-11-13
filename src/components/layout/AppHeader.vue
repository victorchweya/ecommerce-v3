<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import StorefrontIdentity from './StorefrontIdentity.vue'
import { useCheckoutStore } from '@/stores/checkout'
import { useCartStore } from '@/stores/cart'
import CartDrawer from '@/components/cart/CartDrawer.vue'
import { RouterLink, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import Menu from 'primevue/menu'
import Bars from '@primeicons/vue/bars'
import User from '@primeicons/vue/user'
import ShoppingCart from '@primeicons/vue/shopping-cart'
import SignOut from '@primeicons/vue/sign-out'
import Heart from '@primeicons/vue/heart'
import List from '@primeicons/vue/list'
import { useDrawerFocus } from '@/composables/shared/useDrawerFocus'
import HeaderSearch from './HeaderSearch.vue'
import CatalogNavigation from './CatalogNavigation.vue'
import Message from 'primevue/message'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { useOrganization } from '@/composables/organization/useOrganization'
import { useSession } from '@/composables/auth/useSession'
import { errorMessage } from '@/utils/auth'
import { useLogout } from '@/composables/auth/useLogout'
import BranchSelector from '@/components/organization/BranchSelector.vue'
const { rememberTrigger, restoreFocus } = useDrawerFocus()
const auth = useAuthStore()
const cart = useCartStore()
const checkout = useCheckoutStore()
const cartOpen = shallowRef(false)
const route = useRoute()
const mobileOpen = shallowRef(false)
const accountMenu = useTemplateRef<InstanceType<typeof Menu>>('account-menu')
const accountOpen = shallowRef(false)
const focused = computed(
  () =>
    route.path.startsWith('/auth/') ||
    route.name === 'parentAccount' ||
    ['checkout', 'checkoutSuccess'].includes(String(route.name)),
)
const accountItems = computed(() => [
  { label: 'Account', icon: User, to: '/account' },
  { label: 'Orders', icon: List, to: '/orders' },
  { label: 'Favourites', icon: Heart, to: '/favourites' },
  { separator: true },
  { label: 'Sign out', icon: SignOut, disabled: signingOut.value, command: () => signOut() },
])
watch(
  () => route.fullPath,
  () => {
    cartOpen.value = false
    mobileOpen.value = false
    accountMenu.value?.hide()
  },
)
watch(
  () => auth.token,
  () => {
    cartOpen.value = false
    mobileOpen.value = false
    accountMenu.value?.hide()
  },
)
const organization = useOrganizationStore()
const { signingOut, signOut } = useLogout()
const { profile } = useSession()
const { isParent, branches, selectBranch, selectionError, ready } = useOrganization()
const customerName = computed(() => profile.data.value?.name.trim() ?? '')
watch(ready, (value) => {
  if (!value) cartOpen.value = false
})
const branchOptions = computed(() => [...(branches.data.value ?? [])])
function showNavigation(event: Event) {
  rememberTrigger(event)
  mobileOpen.value = true
}
function showCart(event: Event) {
  rememberTrigger(event)
  cartOpen.value = true
}
</script>
<template>
  <header class="border-b border-surface print:hidden">
    <nav aria-label="Main navigation" class="mx-auto flex w-full max-w-8xl flex-col px-4 sm:px-6">
      <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-4 py-5 sm:gap-x-4 lg:gap-x-8">
        <Button
          v-if="auth.token && !focused"
          aria-label="Open navigation"
          aria-controls="mobile-navigation"
          :aria-expanded="mobileOpen"
          severity="secondary"
          variant="text"
          class="size-11 shrink-0 lg:hidden"
          @click="showNavigation"
          ><Bars aria-hidden="true"
        /></Button>
        <StorefrontIdentity class="min-w-0 flex-1 lg:flex-none" />
        <HeaderSearch
          v-if="auth.token && ready && !focused"
          class="order-last w-full basis-full lg:order-none lg:w-auto lg:flex-1"
        />
        <div class="flex shrink-0 items-center gap-1 sm:gap-3 lg:ml-auto">
          <template v-if="auth.token">
            <div
              v-if="customerName && !focused"
              class="hidden max-w-40 items-center gap-2 rounded-full border border-surface py-1 pr-3 pl-1 xl:flex"
              :title="customerName"
            >
              <Avatar
                :label="customerName.slice(0, 1).toUpperCase()"
                shape="circle"
                class="shrink-0"
                aria-hidden="true"
              />
              <span class="truncate">{{ customerName }}</span>
            </div>
            <RouterLink
              v-if="!focused"
              to="/favourites"
              aria-label="Favourites"
              class="relative hidden size-11 shrink-0 items-center justify-center rounded-border hover:bg-emphasis lg:flex"
            >
              <Heart aria-hidden="true" class="size-5" />
            </RouterLink>
            <Button
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-controls="header-account-menu"
              :aria-expanded="accountOpen"
              severity="secondary"
              variant="text"
              class="size-11 p-0 text-color"
              @click="accountMenu?.toggle($event)"
              ><User aria-hidden="true" class="size-5 shrink-0"
            /></Button>
            <Button
              v-if="!focused"
              :aria-label="`Open cart (${cart.count})`"
              aria-controls="cart-drawer"
              :aria-expanded="cartOpen"
              :disabled="!ready || signingOut"
              severity="secondary"
              variant="text"
              class="size-11 p-0 text-color"
              @click="showCart"
              ><span class="relative inline-flex shrink-0">
                <ShoppingCart aria-hidden="true" class="size-5" />
                <Badge
                  v-if="cart.count"
                  :value="cart.count"
                  severity="danger"
                  size="small"
                  class="absolute -top-3 -right-3 tabular-nums"
                  aria-hidden="true" /></span
            ></Button>
            <Menu
              id="header-account-menu"
              ref="account-menu"
              :model="accountItems"
              popup
              @show="accountOpen = true"
              @hide="accountOpen = false"
            >
              <template #item="{ item, icon, label, props: itemProps }">
                <RouterLink
                  v-if="item.to"
                  :to="item.to"
                  v-bind="itemProps.action"
                  class="flex min-h-11 items-center gap-3 px-3 py-2"
                  ><component :is="icon" aria-hidden="true" /><span>{{ label }}</span></RouterLink
                >
                <a
                  v-else
                  v-bind="itemProps.action"
                  class="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2"
                  ><component :is="icon" aria-hidden="true" /><span>{{ label }}</span></a
                >
              </template>
            </Menu>
          </template>
          <RouterLink v-else-if="!focused" to="/auth/login" class="underline">Sign in</RouterLink>
        </div>
      </div>
      <div v-if="auth.token && !focused" class="hidden min-w-0 lg:block">
        <CatalogNavigation :ready="ready" />
      </div>
      <RouterLink v-if="route.name === 'checkout'" to="/cart" class="self-start pb-4 underline"
        >Return to cart</RouterLink
      >
      <div v-if="auth.token && isParent" class="border-t border-surface py-3">
        <BranchSelector
          :branches="branchOptions"
          :selected-id="organization.selectedBranchId"
          :pending="branches.isFetching.value || signingOut || checkout.busy"
          input-id="header-branch"
          @select="selectBranch"
        />
      </div>
      <div
        v-if="auth.token && profile.isError.value"
        class="flex flex-wrap items-center gap-3 pb-4"
      >
        <Message severity="error">{{ errorMessage(profile.error.value) }}</Message>
        <Button
          label="Retry session"
          severity="secondary"
          :loading="profile.isFetching.value"
          :disabled="profile.isFetching.value"
          @click="profile.refetch()"
        />
      </div>
      <Message v-if="selectionError" severity="error">{{ selectionError }}</Message>
    </nav>
    <div
      v-if="checkout.notice && route.name !== 'checkoutSuccess'"
      class="mx-auto flex w-full max-w-8xl flex-wrap items-center gap-3 px-4 pb-4 sm:px-6"
    >
      <p role="status">{{ checkout.notice }}</p>
      <RouterLink to="/orders" class="underline">View confirmed orders</RouterLink>
      <Button
        label="Dismiss order notice"
        severity="secondary"
        variant="text"
        @click="checkout.notice = ''"
      />
    </div>
    <Drawer
      id="mobile-navigation"
      v-model:visible="mobileOpen"
      @after-hide="restoreFocus"
      header="Shop"
      aria-label="Shopping navigation"
      class="w-full sm:w-80"
    >
      <nav
        aria-label="Mobile navigation"
        class="flex flex-col gap-6"
        @click="($event.target as HTMLElement).closest('a') && (mobileOpen = false)"
      >
        <CatalogNavigation :ready="ready" vertical />
        <RouterLink to="/favourites" class="underline">Favourites</RouterLink>
        <RouterLink to="/orders" class="underline">Orders</RouterLink>
        <RouterLink to="/account" class="underline">Account</RouterLink>
        <RouterLink to="/help" class="underline">Help</RouterLink>
      </nav>
    </Drawer>
    <CartDrawer v-if="auth.token" v-model:visible="cartOpen" @after-hide="restoreFocus" />
  </header>
</template>
