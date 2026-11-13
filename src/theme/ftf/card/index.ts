// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { CardDesignTokens } from '@primeuix/themes/types/card'

export default {
  root: {
    background: 'light-dark({neutral.0}, {neutral.900})',
    borderRadius: '{border.radius.xl}',
    color: 'light-dark({neutral.900}, {neutral.0})',
    shadow: 'none',
  },
  body: {
    padding: '1.125rem',
    gap: '0.5rem',
  },
  caption: {
    gap: '0.5rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '500',
  },
  subtitle: {
    color: 'light-dark({neutral.500}, {neutral.400})',
    fontSize: '1rem',
    fontWeight: '{typography.font.weight}',
  },
} satisfies CardDesignTokens
