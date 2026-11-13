// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { ScrollPanelDesignTokens } from '@primeuix/themes/types/scrollpanel'

export default {
  root: {
    transitionDuration: '{transition.duration}',
  },
  bar: {
    size: '9px',
    borderRadius: '{border.radius.sm}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    background: 'light-dark({surface.100}, {surface.800})',
  },
  colorScheme: {
    light: {
      bar: {
        background: '{surface.100}',
      },
    },
    dark: {
      bar: {
        background: '{surface.800}',
      },
    },
  },
} satisfies ScrollPanelDesignTokens
