// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { InputNumberDesignTokens } from '@primeuix/themes/types/inputnumber'

export default {
  root: {
    transitionDuration: '{transition.duration}',
  },
  button: {
    width: '2.25rem',
    borderRadius: '{form.field.border.radius}',
    verticalPadding: '{form.field.padding.y}',
    background: 'transparent',
    hoverBackground: 'light-dark({surface.100}, {surface.800})',
    activeBackground: 'light-dark({surface.200}, {surface.700})',
    borderColor: '{form.field.border.color}',
    hoverBorderColor: '{form.field.border.color}',
    activeBorderColor: '{form.field.border.color}',
    color: '{surface.400}',
    hoverColor: 'light-dark({surface.500}, {surface.300})',
    activeColor: 'light-dark({surface.600}, {surface.200})',
  },
  colorScheme: {
    light: {
      button: {
        background: 'transparent',
        hoverBackground: '{surface.100}',
        activeBackground: '{surface.200}',
        borderColor: '{form.field.border.color}',
        hoverBorderColor: '{form.field.border.color}',
        activeBorderColor: '{form.field.border.color}',
        color: '{surface.400}',
        hoverColor: '{surface.500}',
        activeColor: '{surface.600}',
      },
    },
    dark: {
      button: {
        background: 'transparent',
        hoverBackground: '{surface.800}',
        activeBackground: '{surface.700}',
        borderColor: '{form.field.border.color}',
        hoverBorderColor: '{form.field.border.color}',
        activeBorderColor: '{form.field.border.color}',
        color: '{surface.400}',
        hoverColor: '{surface.300}',
        activeColor: '{surface.200}',
      },
    },
  },
} satisfies InputNumberDesignTokens
