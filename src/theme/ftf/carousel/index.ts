// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { CarouselDesignTokens } from '@primeuix/themes/types/carousel'

export default {
  root: {
    transitionDuration: '{transition.duration}',
  },
  content: {
    gap: '0.25rem',
  },
  indicatorList: {
    padding: '1rem',
    gap: '0.5rem',
  },
  indicator: {
    width: '1.75rem',
    height: '0.5rem',
    borderRadius: '{content.border.radius}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    background: 'light-dark({surface.200}, {surface.700})',
    hoverBackground: 'light-dark({surface.300}, {surface.600})',
    activeBackground: '{primary.color}',
  },
  colorScheme: {
    light: {
      indicator: {
        background: '{surface.200}',
        hoverBackground: '{surface.300}',
        activeBackground: '{primary.color}',
      },
    },
    dark: {
      indicator: {
        background: '{surface.700}',
        hoverBackground: '{surface.600}',
        activeBackground: '{primary.color}',
      },
    },
  },
} satisfies CarouselDesignTokens
