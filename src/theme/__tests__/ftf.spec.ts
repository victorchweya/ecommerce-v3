import { afterEach, describe, expect, it } from 'vitest'
import { $dt, usePreset } from '@primeuix/themes'
import tokens from '@primeuix/themes/tokens'
import Ftf from '../ftf'

const components = import.meta.glob('../../**/*.vue', {
  eager: true,
  query: '?raw',
  import: 'default',
})

afterEach(() => usePreset({}))

describe('FTF theme compatibility', () => {
  it('resolves the documented tokens of every themed PrimeVue component used by the app', () => {
    const used = new Set(
      Object.values(components).flatMap((source) =>
        [...String(source).matchAll(/from ['"]primevue\/([^'"]+)['"]/g)].map((match) => match[1]!),
      ),
    )
    usePreset(Ftf)
    let checked = 0
    for (const name of used) {
      const metadata = tokens[name as keyof typeof tokens]
      if (!metadata?.tokens.length) continue
      expect(Ftf.components, `Missing local theme for ${name}`).toHaveProperty(name)
      for (const { token } of metadata.tokens) {
        const value = $dt(token).value
        expect(value, `Unresolved ${token}`).toBeDefined()
        expect(String(value), `Unresolved reference in ${token}`).not.toMatch(/\{[^}]+\}/)
        checked++
      }
    }
    expect(checked).toBeGreaterThan(0)
  })
})
