// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { AccordionDesignTokens } from '@primeuix/themes/types/accordion'

export default {
  root: {
    transitionDuration: '{transition.duration}',
  },
  panel: {
    borderWidth: '0 0 1px 0',
    borderColor: '{content.border.color}',
  },
  header: {
    color: '{text.muted.color}',
    hoverColor: '{text.color}',
    activeColor: '{text.color}',
    activeHoverColor: '{text.color}',
    padding: '1rem',
    fontWeight: '600',
    borderRadius: '0',
    borderWidth: '0',
    borderColor: '{content.border.color}',
    background: '{content.background}',
    hoverBackground: '{content.background}',
    activeBackground: '{content.background}',
    activeHoverBackground: '{content.background}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '-1px',
      shadow: '{focus.ring.shadow}',
    },
    toggleIcon: {
      color: '{text.muted.color}',
      hoverColor: '{text.color}',
      activeColor: '{text.color}',
      activeHoverColor: '{text.color}',
    },
    first: {
      topBorderRadius: '{content.border.radius}',
      borderWidth: '0',
    },
    last: {
      bottomBorderRadius: '{content.border.radius}',
      activeBottomBorderRadius: '0',
    },
    fontSize: '{typography.font.size}',
  },
  content: {
    borderWidth: '0',
    borderColor: '{content.border.color}',
    background: '{content.background}',
    color: '{text.color}',
    padding: '0 1rem 1rem 1rem',
  },
} satisfies AccordionDesignTokens
