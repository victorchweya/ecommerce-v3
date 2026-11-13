// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { ConfirmDialogDesignTokens } from '@primeuix/themes/types/confirmdialog'

export default {
  icon: {
    size: '1.5rem',
    color: '{overlay.modal.color}',
  },
  content: {
    gap: '0.875rem',
  },
  message: {
    color: '{text.color}',
    fontWeight: '{typography.font.weight}',
    fontSize: '{typography.font.size}',
  },
} satisfies ConfirmDialogDesignTokens
