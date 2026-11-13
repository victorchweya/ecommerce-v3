// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { TooltipDesignTokens } from '@primeuix/themes/types/tooltip'

export default {
  root: {
    maxWidth: '12.5rem',
    gutter: '0.25rem',
    shadow: '{overlay.popover.shadow}',
    padding: '0.375rem 0.625rem',
    borderRadius: '{overlay.popover.border.radius}',
    background: '{surface.700}',
    color: '{surface.0}',
    fontWeight: '{typography.font.weight}',
    fontSize: '0.75rem',
  },
  colorScheme: {
    light: {
      root: {
        background: '{surface.700}',
        color: '{surface.0}',
      },
    },
    dark: {
      root: {
        background: '{surface.700}',
        color: '{surface.0}',
      },
    },
  },
} satisfies TooltipDesignTokens
