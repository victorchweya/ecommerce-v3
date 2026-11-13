// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { MenubarDesignTokens } from '@primeuix/themes/types/menubar'

export default {
  root: {
    background: '{content.background}',
    borderColor: '{content.border.color}',
    borderRadius: '{content.border.radius}',
    color: '{content.color}',
    gap: '0.5rem',
    padding: '0.375rem 0.625rem',
    transitionDuration: '0s',
  },
  baseItem: {
    borderRadius: '{content.border.radius}',
    padding: '{navigation.item.padding}',
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
    padding: '{navigation.list.padding}',
    gap: '{navigation.list.gap}',
    background: '{content.background}',
    borderColor: '{content.border.color}',
    borderRadius: '{content.border.radius}',
    shadow: '{overlay.navigation.shadow}',
    mobileIndent: '0.875rem',
    icon: {
      size: '{navigation.submenu.icon.size}',
      color: '{navigation.submenu.icon.color}',
      focusColor: '{navigation.submenu.icon.focus.color}',
      activeColor: '{navigation.submenu.icon.active.color}',
    },
  },
  separator: {
    borderColor: '{content.border.color}',
  },
  mobileButton: {
    borderRadius: '50%',
    size: '1.5rem',
    color: '{text.muted.color}',
    hoverColor: '{text.hover.muted.color}',
    hoverBackground: '{content.hover.background}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
  },
} satisfies MenubarDesignTokens
