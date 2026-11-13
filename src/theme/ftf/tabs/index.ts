// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { TabsDesignTokens } from '@primeuix/themes/types/tabs'

export default {
  root: {
    transitionDuration: '{transition.duration}',
  },
  tablist: {
    borderWidth: '0 0 1px 0',
    background: '{content.background}',
    borderColor: '{content.border.color}',
  },
  tab: {
    background: 'transparent',
    hoverBackground: 'transparent',
    activeBackground: 'transparent',
    borderWidth: '0',
    borderColor: 'transparent',
    hoverBorderColor: 'transparent',
    activeBorderColor: 'transparent',
    color: '{text.muted.color}',
    hoverColor: '{text.color}',
    activeColor: '{primary.color}',
    padding: '0.875rem 1rem',
    fontWeight: '600',
    margin: '0',
    gap: '0.5rem',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '-1px',
      shadow: '{focus.ring.shadow}',
    },
    fontSize: '{typography.font.size}',
  },
  tabpanel: {
    background: '{content.background}',
    color: '{content.color}',
    padding: '0.75rem 1rem 1rem 1rem',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: 'inset {focus.ring.shadow}',
    },
  },
  navButton: {
    background: '{content.background}',
    color: '{text.muted.color}',
    hoverColor: '{text.color}',
    width: '2.25rem',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '-1px',
      shadow: '{focus.ring.shadow}',
    },
    shadow:
      'light-dark(0px 0px 10px 50px rgba(255, 255, 255, 0.6), 0px 0px 10px 50px color-mix(in srgb, {content.background}, transparent 50%))',
  },
  activeBar: {
    height: '1px',
    bottom: '0',
    background: '{primary.color}',
  },
  colorScheme: {
    light: {
      navButton: {
        shadow: '0px 0px 10px 50px rgba(255, 255, 255, 0.6)',
      },
    },
    dark: {
      navButton: {
        shadow: '0px 0px 10px 50px color-mix(in srgb, {content.background}, transparent 50%)',
      },
    },
  },
} satisfies TabsDesignTokens
