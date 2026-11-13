// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { BreadcrumbDesignTokens } from '@primeuix/themes/types/breadcrumb'

export default {
  root: {
    padding: '0.875rem',
    background: '{content.background}',
    gap: '0.5rem',
    transitionDuration: '{transition.duration}',
  },
  item: {
    color: '{text.muted.color}',
    hoverColor: '{text.color}',
    borderRadius: '{content.border.radius}',
    gap: '{navigation.item.gap}',
    icon: {
      color: '{navigation.item.icon.color}',
      hoverColor: '{navigation.item.icon.focus.color}',
      size: '{icon.size}',
    },
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    label: {
      fontWeight: '{typography.font.weight}',
      fontSize: '{typography.font.size}',
    },
  },
  separator: {
    color: '{navigation.item.icon.color}',
  },
} satisfies BreadcrumbDesignTokens
