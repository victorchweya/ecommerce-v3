// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { SelectButtonDesignTokens } from '@primeuix/themes/types/selectbutton'

export default {
  root: {
    borderRadius: '{form.field.border.radius}',
    invalidBorderColor: '{form.field.invalid.border.color}',
  },
  colorScheme: {
    light: {
      root: {
        invalidBorderColor: '{form.field.invalid.border.color}',
      },
    },
    dark: {
      root: {
        invalidBorderColor: '{form.field.invalid.border.color}',
      },
    },
  },
} satisfies SelectButtonDesignTokens
