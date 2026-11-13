// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { ConfirmPopupDesignTokens } from '@primeuix/themes/types/confirmpopup'

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
    gap: '0.5rem',
  },
  icon: {
    size: '1.25rem',
    color: '{overlay.popover.color}',
  },
  footer: {
    gap: '0.375rem',
    padding: '0 {overlay.popover.padding} {overlay.popover.padding} {overlay.popover.padding}',
  },
  message: {
    color: '{text.color}',
    fontWeight: '{typography.font.weight}',
    fontSize: '{typography.font.size}',
  },
} satisfies ConfirmPopupDesignTokens
