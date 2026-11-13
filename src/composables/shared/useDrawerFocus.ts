import { useRoute } from 'vue-router'

export function useDrawerFocus() {
  const route = useRoute()
  let trigger: HTMLElement | null = null
  let openedPath = ''
  function rememberTrigger(event: Event) {
    trigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    openedPath = route.path
  }
  function restoreFocus() {
    const target =
      openedPath === route.path && trigger?.isConnected
        ? trigger
        : document.getElementById('main-content')
    target?.focus({ preventScroll: true })
  }
  return { rememberTrigger, restoreFocus }
}
