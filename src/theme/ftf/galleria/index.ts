// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { GalleriaDesignTokens } from '@primeuix/themes/types/galleria'

export default {
  root: {
    borderWidth: '1px',
    borderColor: '{content.border.color}',
    borderRadius: '{content.border.radius}',
    transitionDuration: '{transition.duration}',
  },
  navButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    hoverBackground: 'rgba(255, 255, 255, 0.2)',
    color: '{surface.100}',
    hoverColor: '{surface.0}',
    size: '2.625rem',
    gutter: '0.5rem',
    prev: {
      borderRadius: '50%',
    },
    next: {
      borderRadius: '50%',
    },
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
  },
  navIcon: {
    size: '1.25rem',
  },
  thumbnailsContent: {
    background: '{content.background}',
    padding: '0.875rem 0.25rem',
  },
  thumbnailNavButton: {
    size: '1.75rem',
    borderRadius: '{content.border.radius}',
    gutter: '0.5rem',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    hoverBackground: 'light-dark({surface.100}, {surface.700})',
    color: 'light-dark({surface.600}, {surface.400})',
    hoverColor: 'light-dark({surface.700}, {surface.0})',
  },
  thumbnailNavButtonIcon: {
    size: '0.875rem',
  },
  caption: {
    background: 'rgba(0, 0, 0, 0.5)',
    color: '{surface.100}',
    padding: '0.875rem',
  },
  indicatorList: {
    gap: '0.5rem',
    padding: '0.875rem',
  },
  indicatorButton: {
    width: '0.875rem',
    height: '0.875rem',
    activeBackground: '{primary.color}',
    borderRadius: '50%',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    background: 'light-dark({surface.200}, {surface.700})',
    hoverBackground: 'light-dark({surface.300}, {surface.600})',
  },
  insetIndicatorList: {
    background: 'rgba(0, 0, 0, 0.5)',
  },
  insetIndicatorButton: {
    background: 'rgba(255, 255, 255, 0.4)',
    hoverBackground: 'rgba(255, 255, 255, 0.6)',
    activeBackground: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    size: '2.625rem',
    gutter: '0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    hoverBackground: 'rgba(255, 255, 255, 0.2)',
    color: '{surface.50}',
    hoverColor: '{surface.0}',
    borderRadius: '50%',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
  },
  closeButtonIcon: {
    size: '1.25rem',
  },
  colorScheme: {
    light: {
      thumbnailNavButton: {
        hoverBackground: '{surface.100}',
        color: '{surface.600}',
        hoverColor: '{surface.700}',
      },
      indicatorButton: {
        background: '{surface.200}',
        hoverBackground: '{surface.300}',
      },
    },
    dark: {
      thumbnailNavButton: {
        hoverBackground: '{surface.700}',
        color: '{surface.400}',
        hoverColor: '{surface.0}',
      },
      indicatorButton: {
        background: '{surface.700}',
        hoverBackground: '{surface.600}',
      },
    },
  },
} satisfies GalleriaDesignTokens
