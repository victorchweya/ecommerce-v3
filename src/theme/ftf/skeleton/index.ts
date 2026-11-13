// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { SkeletonDesignTokens } from '@primeuix/themes/types/skeleton'

export default {
  root: {
    borderRadius: '{content.border.radius}',
    background: 'light-dark({surface.200}, rgba(255, 255, 255, 0.06))',
    animationBackground: 'light-dark(rgba(255,255,255,0.4), rgba(255, 255, 255, 0.04))',
  },
  colorScheme: {
    light: {
      root: {
        background: '{surface.200}',
        animationBackground: 'rgba(255,255,255,0.4)',
      },
    },
    dark: {
      root: {
        background: 'rgba(255, 255, 255, 0.06)',
        animationBackground: 'rgba(255, 255, 255, 0.04)',
      },
    },
  },
} satisfies SkeletonDesignTokens
