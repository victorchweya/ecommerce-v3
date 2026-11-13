// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { BadgeDesignTokens } from '@primeuix/themes/types/badge'

export default {
  root: {
    borderRadius: '{border.radius.md}',
    padding: '0 0.375rem',
    fontSize: '0.625rem',
    fontWeight: '700',
    minWidth: '1.25rem',
    height: '1.25rem',
  },
  dot: {
    size: '0.5rem',
  },
  sm: {
    fontSize: '0.5rem',
    minWidth: '1.125rem',
    height: '1.125rem',
  },
  lg: {
    fontSize: '0.75rem',
    minWidth: '1.5rem',
    height: '1.5rem',
  },
  xl: {
    fontSize: '0.875rem',
    minWidth: '1.75rem',
    height: '1.75rem',
  },
  colorScheme: {
    light: {
      primary: {
        background: '{primary.color}',
        color: '{primary.contrast.color}',
      },
      secondary: {
        background: '{surface.100}',
        color: '{surface.600}',
      },
      success: {
        background: '{green.500}',
        color: '{surface.0}',
      },
      info: {
        background: '{sky.500}',
        color: '{surface.0}',
      },
      warn: {
        background: '{orange.500}',
        color: '{surface.0}',
      },
      danger: {
        background: '{red.500}',
        color: '{surface.0}',
      },
      contrast: {
        background: '{surface.950}',
        color: '{surface.0}',
      },
    },
    dark: {
      primary: {
        background: '{primary.color}',
        color: '{primary.contrast.color}',
      },
      secondary: {
        background: '{surface.800}',
        color: '{surface.300}',
      },
      success: {
        background: '{green.400}',
        color: '{green.950}',
      },
      info: {
        background: '{sky.400}',
        color: '{sky.950}',
      },
      warn: {
        background: '{orange.400}',
        color: '{orange.950}',
      },
      danger: {
        background: '{red.400}',
        color: '{red.950}',
      },
      contrast: {
        background: '{surface.0}',
        color: '{surface.950}',
      },
    },
  },
  primary: {
    background: '{primary.color}',
    color: '{primary.contrast.color}',
  },
  secondary: {
    background: 'light-dark({surface.100}, {surface.800})',
    color: 'light-dark({surface.600}, {surface.300})',
  },
  success: {
    background: 'light-dark({green.500}, {green.400})',
    color: 'light-dark({surface.0}, {green.950})',
  },
  info: {
    background: 'light-dark({sky.500}, {sky.400})',
    color: 'light-dark({surface.0}, {sky.950})',
  },
  warn: {
    background: 'light-dark({orange.500}, {orange.400})',
    color: 'light-dark({surface.0}, {orange.950})',
  },
  danger: {
    background: 'light-dark({red.500}, {red.400})',
    color: 'light-dark({surface.0}, {red.950})',
  },
  contrast: {
    background: 'light-dark({surface.950}, {surface.0})',
    color: 'light-dark({surface.0}, {surface.950})',
  },
} satisfies BadgeDesignTokens
