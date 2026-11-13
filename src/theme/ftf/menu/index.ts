// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { MenuDesignTokens } from '@primeuix/themes/types/menu'

export default {
  root: {
    background: '{content.background}',
    borderColor: '{content.border.color}',
    color: '{content.color}',
    borderRadius: '{content.border.radius}',
    shadow: '{overlay.navigation.shadow}',
    transitionDuration: '0s',
  },
  list: {
    padding: '{navigation.list.padding}',
    gap: '{navigation.list.gap}',
  },
  item: {
    focusBackground: '{navigation.item.focus.background}',
    color: '{navigation.item.color}',
    focusColor: '{navigation.item.focus.color}',
    padding: '{navigation.item.padding}',
    borderRadius: '{navigation.item.border.radius}',
    gap: '{navigation.item.gap}',
    icon: {
      color: '{navigation.item.icon.color}',
      focusColor: '{navigation.item.icon.focus.color}',
      size: '{icon.size}',
    },
    label: {
      fontWeight: '{typography.font.weight}',
      fontSize: '{typography.font.size}',
    },
  },
  submenuLabel: {
    padding: '{navigation.submenu.label.padding}',
    fontWeight: '{navigation.submenu.label.font.weight}',
    background: '{navigation.submenu.label.background}',
    color: '{navigation.submenu.label.color}',
    fontSize: '{typography.font.size}',
  },
  separator: {
    borderColor: '{content.border.color}',
  },
  submenuIcon: {
    size: '0.75rem',
    color: 'light-dark({surface.400},{surface.500})',
    focusColor: '{text.muted.color}',
  },
} satisfies MenuDesignTokens
