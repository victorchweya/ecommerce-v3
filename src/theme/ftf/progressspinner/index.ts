// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { ProgressSpinnerDesignTokens } from '@primeuix/themes/types/progressspinner'

export default {
  colorScheme: {
    light: {
      root: {
        colorOne: '{red.500}',
        colorTwo: '{blue.500}',
        colorThree: '{green.500}',
        colorFour: '{yellow.500}',
      },
    },
    dark: {
      root: {
        colorOne: '{red.400}',
        colorTwo: '{blue.400}',
        colorThree: '{green.400}',
        colorFour: '{yellow.400}',
      },
    },
  },
  root: {
    colorOne: 'light-dark({red.500}, {red.400})',
    colorTwo: 'light-dark({blue.500}, {blue.400})',
    colorThree: 'light-dark({green.500}, {green.400})',
    colorFour: 'light-dark({yellow.500}, {yellow.400})',
  },
} satisfies ProgressSpinnerDesignTokens
