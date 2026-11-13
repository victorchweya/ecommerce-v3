// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { PanelMenuDesignTokens } from '@primeuix/themes/types/panelmenu'

export default {
  root: {
    gap: '0.5rem',
    transitionDuration: '0s',
  },
  panel: {
    background: '{content.background}',
    borderColor: '{content.border.color}',
    borderWidth: '1px',
    color: '{content.color}',
    padding: '0.25rem 0.25rem',
    borderRadius: '{content.border.radius}',
    first: {
      borderWidth: '1px',
      topBorderRadius: '{content.border.radius}',
    },
    last: {
      borderWidth: '1px',
      bottomBorderRadius: '{content.border.radius}',
    },
  },
  item: {
    focusBackground: '{navigation.item.focus.background}',
    color: '{navigation.item.color}',
    focusColor: '{navigation.item.focus.color}',
    gap: '0.5rem',
    padding: '{navigation.item.padding}',
    borderRadius: '{content.border.radius}',
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
  submenu: {
    indent: '1rem',
  },
  submenuIcon: {
    color: '{navigation.submenu.icon.color}',
    focusColor: '{navigation.submenu.icon.focus.color}',
  },
} satisfies PanelMenuDesignTokens
