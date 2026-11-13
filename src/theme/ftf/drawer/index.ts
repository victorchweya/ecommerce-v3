// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { DrawerDesignTokens } from '@primeuix/themes/types/drawer'

export default {
  root: {
    background: '{overlay.modal.background}',
    borderColor: '{overlay.modal.border.color}',
    color: '{overlay.modal.color}',
    shadow: '{overlay.modal.shadow}',
  },
  header: {
    padding: '{overlay.modal.padding}',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
  },
  content: {
    padding: '0 {overlay.modal.padding} {overlay.modal.padding} {overlay.modal.padding}',
  },
  footer: {
    padding: '{overlay.modal.padding}',
  },
} satisfies DrawerDesignTokens
