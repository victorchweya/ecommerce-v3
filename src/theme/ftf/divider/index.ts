// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { DividerDesignTokens } from '@primeuix/themes/types/divider'

export default {
  root: {
    borderColor: '{content.border.color}',
  },
  content: {
    background: '{content.background}',
    color: '{text.color}',
  },
  horizontal: {
    margin: '0.875rem 0',
    padding: '0 0.875rem',
    content: {
      padding: '0 0.375rem',
    },
  },
  vertical: {
    margin: '0 0.875rem',
    padding: '0.375rem 0',
    content: {
      padding: '0.375rem 0',
    },
  },
} satisfies DividerDesignTokens
