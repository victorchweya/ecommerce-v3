// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { OrganizationChartDesignTokens } from '@primeuix/themes/types/organizationchart'

export default {
  root: {
    gutter: '0.625rem',
    transitionDuration: '{transition.duration}',
  },
  node: {
    background: '{content.background}',
    hoverBackground: '{content.hover.background}',
    selectedBackground: '{highlight.background}',
    borderColor: '{content.border.color}',
    color: '{content.color}',
    selectedColor: '{highlight.color}',
    hoverColor: '{content.hover.color}',
    padding: '0.625rem 0.875rem',
    toggleablePadding: '0.625rem 0.875rem 1.125rem 0.875rem',
    borderRadius: '{content.border.radius}',
    fontSize: '{typography.font.size}',
    fontWeight: '{typography.font.weight}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{primary.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
  },
  nodeToggleButton: {
    background: '{content.background}',
    hoverBackground: '{content.hover.background}',
    borderColor: '{content.border.color}',
    color: '{text.muted.color}',
    hoverColor: '{text.color}',
    size: '1.25rem',
    borderRadius: '50%',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    icon: {
      size: '0.75rem',
    },
  },
  connector: {
    color: '{content.border.color}',
    borderRadius: '{content.border.radius}',
    height: '24px',
  },
} satisfies OrganizationChartDesignTokens
