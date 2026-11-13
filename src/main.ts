import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Ftf from './theme/ftf'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import { queryClient } from './lib/query-client'
import './assets/styles/main.css'
import { installAuthGuards } from './router/guards'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: Ftf,
    options: {
      cssLayer: { name: 'primevue', order: 'theme, base, primevue, components, utilities' },
    },
  },
  license: import.meta.env.VITE_PRIMEUI_LICENSE_KEY,
})
app.use(VueQueryPlugin, { queryClient })
installAuthGuards(router, pinia)
app.use(router)
app.mount('#app')
