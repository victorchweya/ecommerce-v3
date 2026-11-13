// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { PopoverDesignTokens } from '@primeuix/themes/types/popover'

export default {
  root: {
    background: '{overlay.popover.background}',
    borderColor: '{overlay.popover.border.color}',
    color: '{overlay.popover.color}',
    borderRadius: '{overlay.popover.border.radius}',
    shadow: '{overlay.popover.shadow}',
    gutter: '10px',
    arrowOffset: '1.125rem',
  },
  content: {
    padding: '{overlay.popover.padding}',
  },
} satisfies PopoverDesignTokens
