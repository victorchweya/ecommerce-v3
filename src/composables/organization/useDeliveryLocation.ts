import { onScopeDispose, ref } from 'vue'
import { coordinatesSchema } from '@/validation/organization'
export function useDeliveryLocation() {
  const latitude = ref('')
  const longitude = ref('')
  const locating = ref(false)
  const error = ref('')
  let active = true
  onScopeDispose(() => {
    active = false
  })
  function locate() {
    if (locating.value) return
    error.value = ''
    if (!navigator.geolocation) {
      error.value = 'Current location is unavailable. Enter the delivery coordinates manually.'
      return
    }
    locating.value = true
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return
        latitude.value = String(position.coords.latitude)
        longitude.value = String(position.coords.longitude)
        locating.value = false
      },
      () => {
        if (!active) return
        error.value = 'We could not get your location. Enter the delivery coordinates manually.'
        locating.value = false
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    )
  }
  function coordinates() {
    const result = coordinatesSchema.safeParse({
      latitude: latitude.value.trim() ? Number(latitude.value) : NaN,
      longitude: longitude.value.trim() ? Number(longitude.value) : NaN,
    })
    if (!result.success) {
      error.value = 'Choose a delivery location or enter valid latitude and longitude.'
      return
    }
    error.value = ''
    return result.data
  }
  return { latitude, longitude, locating, error, locate, coordinates }
}
