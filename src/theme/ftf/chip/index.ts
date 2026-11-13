// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { ChipDesignTokens } from '@primeuix/themes/types/chip'

export default {
  root: {
    borderRadius: '1rem',
    paddingX: '0.625rem',
    paddingY: '0.375rem',
    gap: '0.375rem',
    transitionDuration: '{transition.duration}',
    background: 'light-dark({surface.100}, {surface.800})',
    focusBackground: '{content.border.color}',
    color: 'light-dark({surface.800}, {surface.0})',
  },
  image: {
    width: '1.75rem',
    height: '1.75rem',
  },
  icon: {
    size: '0.875rem',
    color: 'light-dark({surface.800}, {surface.0})',
  },
  removeIcon: {
    size: '0.875rem',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{form.field.focus.ring.shadow}',
    },
    color: 'light-dark({surface.800}, {surface.0})',
  },
  colorScheme: {
    light: {
      root: {
        background: '{surface.100}',
        color: '{surface.800}',
      },
      icon: {
        color: '{surface.800}',
      },
      removeIcon: {
        color: '{surface.800}',
      },
    },
    dark: {
      root: {
        background: '{surface.800}',
        color: '{surface.0}',
      },
      icon: {
        color: '{surface.0}',
      },
      removeIcon: {
        color: '{surface.0}',
      },
    },
  },
  label: {
    fontWeight: '{typography.font.weight}',
    fontSize: '0.75rem',
  },
} satisfies ChipDesignTokens
