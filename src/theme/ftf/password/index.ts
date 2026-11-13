// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { PasswordDesignTokens } from '@primeuix/themes/types/password'

export default {
  meter: {
    background: '{content.border.color}',
    borderRadius: '{content.border.radius}',
    height: '0.625rem',
  },
  icon: {
    color: '{form.field.icon.color}',
  },
  overlay: {
    background: '{overlay.popover.background}',
    borderColor: '{overlay.popover.border.color}',
    borderRadius: '{overlay.popover.border.radius}',
    color: '{overlay.popover.color}',
    padding: '{overlay.popover.padding}',
    shadow: '{overlay.popover.shadow}',
  },
  content: {
    gap: '0.5rem',
  },
  colorScheme: {
    light: {
      strength: {
        weakBackground: '{red.500}',
        mediumBackground: '{amber.500}',
        strongBackground: '{green.500}',
      },
    },
    dark: {
      strength: {
        weakBackground: '{red.400}',
        mediumBackground: '{amber.400}',
        strongBackground: '{green.400}',
      },
    },
  },
  meterText: {
    fontWeight: '{typography.font.weight}',
    fontSize: '{typography.font.size}',
  },
  strength: {
    weakBackground: 'light-dark({red.500}, {red.400})',
    mediumBackground: 'light-dark({amber.500}, {amber.400})',
    strongBackground: 'light-dark({green.500}, {green.400})',
  },
} satisfies PasswordDesignTokens
