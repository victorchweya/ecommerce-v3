// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { RippleDesignTokens } from '@primeuix/themes/types/ripple'

export default {
  colorScheme: {
    light: {
      root: {
        background: 'rgba(0,0,0,0.1)',
      },
    },
    dark: {
      root: {
        background: 'rgba(255,255,255,0.3)',
      },
    },
  },
  root: {
    background: 'light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.3))',
  },
} satisfies RippleDesignTokens
