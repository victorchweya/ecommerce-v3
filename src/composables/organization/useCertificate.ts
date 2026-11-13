import { onScopeDispose, ref } from 'vue'
export function useCertificate() {
  const data = ref<string>()
  const name = ref('')
  const error = ref('')
  const reading = ref(false)
  let reader: FileReader | undefined
  function clear() {
    reader?.abort()
    reader = undefined
    data.value = undefined
    name.value = ''
    error.value = ''
    reading.value = false
  }
  function select(file: File | undefined) {
    clear()
    if (!file) return
    if (
      file.size > 5_000_000 ||
      !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    ) {
      error.value = 'Choose a PDF, JPEG, PNG, or WebP file up to 5 MB.'
      return
    }
    const current = new FileReader()
    reader = current
    reading.value = true
    current.onload = () => {
      if (reader !== current) return
      if (typeof current.result === 'string') {
        data.value = current.result
        name.value = file.name
      }
      reading.value = false
    }
    current.onerror = () => {
      if (reader !== current) return
      error.value = 'We could not read the certificate. Choose it again.'
      reading.value = false
    }
    current.readAsDataURL(file)
  }
  onScopeDispose(clear)
  return { data, name, error, reading, select, clear }
}
