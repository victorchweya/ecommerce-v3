// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { ContextMenuDesignTokens } from '@primeuix/themes/types/contextmenu'

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
    activeBackground: '{navigation.item.active.background}',
    color: '{navigation.item.color}',
    focusColor: '{navigation.item.focus.color}',
    activeColor: '{navigation.item.active.color}',
    padding: '{navigation.item.padding}',
    borderRadius: '{navigation.item.border.radius}',
    gap: '{navigation.item.gap}',
    icon: {
      color: '{navigation.item.icon.color}',
      focusColor: '{navigation.item.icon.focus.color}',
      activeColor: '{navigation.item.icon.active.color}',
      size: '{icon.size}',
    },
    label: {
      fontWeight: '{typography.font.weight}',
      fontSize: '{typography.font.size}',
    },
  },
  submenu: {
    mobileIndent: '1rem',
  },
  submenuIcon: {
    size: '{navigation.submenu.icon.size}',
    color: '{navigation.submenu.icon.color}',
    focusColor: '{navigation.submenu.icon.focus.color}',
    activeColor: '{navigation.submenu.icon.active.color}',
  },
  separator: {
    borderColor: '{content.border.color}',
  },
  submenuLabel: {
    padding: '{list.option.padding}',
    fontWeight: '600',
    fontSize: '{typography.font.size}',
    background: '{menu.submenu.label.background}',
    color: '{text.muted.color}',
  },
} satisfies ContextMenuDesignTokens
