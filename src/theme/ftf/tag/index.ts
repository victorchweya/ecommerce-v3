// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { TagDesignTokens } from '@primeuix/themes/types/tag'

export default {
  root: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.125rem 0.375rem',
    gap: '0.25rem',
    borderRadius: '{content.border.radius}',
    roundedBorderRadius: '{border.radius.xl}',
  },
  icon: {
    size: '0.625rem',
  },
  colorScheme: {
    light: {
      primary: {
        background: '{primary.100}',
        color: '{primary.700}',
      },
      secondary: {
        background: '{surface.100}',
        color: '{surface.600}',
      },
      success: {
        background: '{green.100}',
        color: '{green.700}',
      },
      info: {
        background: '{sky.100}',
        color: '{sky.700}',
      },
      warn: {
        background: '{orange.100}',
        color: '{orange.700}',
      },
      danger: {
        background: '{red.100}',
        color: '{red.700}',
      },
      contrast: {
        background: '{surface.950}',
        color: '{surface.0}',
      },
    },
    dark: {
      primary: {
        background: 'color-mix(in srgb, {primary.500}, transparent 84%)',
        color: '{primary.300}',
      },
      secondary: {
        background: '{surface.800}',
        color: '{surface.300}',
      },
      success: {
        background: 'color-mix(in srgb, {green.500}, transparent 84%)',
        color: '{green.300}',
      },
      info: {
        background: 'color-mix(in srgb, {sky.500}, transparent 84%)',
        color: '{sky.300}',
      },
      warn: {
        background: 'color-mix(in srgb, {orange.500}, transparent 84%)',
        color: '{orange.300}',
      },
      danger: {
        background: 'color-mix(in srgb, {red.500}, transparent 84%)',
        color: '{red.300}',
      },
      contrast: {
        background: '{surface.0}',
        color: '{surface.950}',
      },
    },
  },
  primary: {
    background: 'light-dark({primary.100}, color-mix(in srgb, {primary.500}, transparent 84%))',
    color: 'light-dark({primary.700}, {primary.300})',
  },
  secondary: {
    background: 'light-dark({surface.100}, {surface.800})',
    color: 'light-dark({surface.600}, {surface.300})',
  },
  success: {
    background: 'light-dark({green.100}, color-mix(in srgb, {green.500}, transparent 84%))',
    color: 'light-dark({green.700}, {green.300})',
  },
  info: {
    background: 'light-dark({sky.100}, color-mix(in srgb, {sky.500}, transparent 84%))',
    color: 'light-dark({sky.700}, {sky.300})',
  },
  warn: {
    background: 'light-dark({orange.100}, color-mix(in srgb, {orange.500}, transparent 84%))',
    color: 'light-dark({orange.700}, {orange.300})',
  },
  danger: {
    background: 'light-dark({red.100}, color-mix(in srgb, {red.500}, transparent 84%))',
    color: 'light-dark({red.700}, {red.300})',
  },
  contrast: {
    background: 'light-dark({surface.950}, {surface.0})',
    color: 'light-dark({surface.0}, {surface.950})',
  },
} satisfies TagDesignTokens
