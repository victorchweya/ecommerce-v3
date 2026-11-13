// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { ToggleButtonDesignTokens } from '@primeuix/themes/types/togglebutton'

export default {
  root: {
    padding: '0.25rem',
    borderRadius: '{content.border.radius}',
    gap: '0.5rem',
    fontWeight: '500',
    disabledBackground: '{form.field.disabled.background}',
    disabledBorderColor: '{form.field.disabled.background}',
    disabledColor: '{form.field.disabled.color}',
    invalidBorderColor: '{form.field.invalid.border.color}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    transitionDuration: '{form.field.transition.duration}',
    sm: {
      fontSize: '{form.field.sm.font.size}',
      padding: '0.25rem',
    },
    lg: {
      fontSize: '{form.field.lg.font.size}',
      padding: '0.25rem',
    },
    fontSize: '{typography.font.size}',
    background: 'light-dark({surface.100}, {surface.950})',
    checkedBackground: 'light-dark({surface.200}, {surface.700})',
    hoverBackground: 'light-dark({surface.100}, {surface.950})',
    borderColor: '{content.border.color}',
    color: 'light-dark({surface.500}, {surface.400})',
    hoverColor: 'light-dark({surface.700}, {surface.300})',
    checkedColor: 'light-dark({surface.900}, {surface.0})',
    checkedBorderColor: '{content.border.color}',
  },
  icon: {
    disabledColor: '{form.field.disabled.color}',
    color: 'light-dark({surface.500}, {surface.400})',
    hoverColor: 'light-dark({surface.700}, {surface.300})',
    checkedColor: 'light-dark({surface.900}, {surface.0})',
  },
  content: {
    padding: '0.125rem 0.625rem',
    borderRadius: '{content.border.radius}',
    checkedShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.02), 0px 1px 2px 0px rgba(0, 0, 0, 0.04)',
    sm: {
      padding: '0.125rem 0.625rem',
    },
    lg: {
      padding: '0.125rem 0.625rem',
    },
    checkedBackground: 'light-dark({surface.0}, {surface.800})',
  },
  colorScheme: {
    light: {
      root: {
        background: '{surface.100}',
        checkedBackground: '{surface.200}',
        hoverBackground: '{surface.100}',
        borderColor: '{content.border.color}',
        color: '{surface.500}',
        hoverColor: '{surface.700}',
        checkedColor: '{surface.900}',
        checkedBorderColor: '{content.border.color}',
      },
      content: {
        checkedBackground: '{surface.0}',
      },
      icon: {
        color: '{surface.500}',
        hoverColor: '{surface.700}',
        checkedColor: '{surface.900}',
      },
    },
    dark: {
      root: {
        background: '{surface.950}',
        checkedBackground: '{surface.700}',
        hoverBackground: '{surface.950}',
        borderColor: '{content.border.color}',
        color: '{surface.400}',
        hoverColor: '{surface.300}',
        checkedColor: '{surface.0}',
        checkedBorderColor: '{content.border.color}',
      },
      content: {
        checkedBackground: '{surface.800}',
      },
      icon: {
        color: '{surface.400}',
        hoverColor: '{surface.300}',
        checkedColor: '{surface.0}',
      },
    },
  },
} satisfies ToggleButtonDesignTokens
