// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { PaginatorDesignTokens } from '@primeuix/themes/types/paginator'

export default {
  root: {
    padding: '0.375rem 0.875rem',
    gap: '0.25rem',
    borderRadius: '{content.border.radius}',
    background: '{content.background}',
    color: '{content.color}',
    transitionDuration: '{transition.duration}',
  },
  navButton: {
    background: 'transparent',
    hoverBackground: '{content.hover.background}',
    selectedBackground: '{highlight.background}',
    color: '{text.muted.color}',
    hoverColor: '{text.hover.muted.color}',
    selectedColor: '{highlight.color}',
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '50%',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    fontWeight: '{typography.font.weight}',
    fontSize: '{typography.font.size}',
  },
  currentPageReport: {
    color: '{text.muted.color}',
    fontWeight: '{typography.font.weight}',
    fontSize: '{typography.font.size}',
  },
  jumpToPageInput: {
    maxWidth: '2.25rem',
  },
} satisfies PaginatorDesignTokens
