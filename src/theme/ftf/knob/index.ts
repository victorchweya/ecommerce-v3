// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { KnobDesignTokens } from '@primeuix/themes/types/knob'

export default {
  root: {
    transitionDuration: '{transition.duration}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
  },
  value: {
    background: '{primary.color}',
  },
  range: {
    background: '{content.border.color}',
  },
  text: {
    color: '{text.muted.color}',
    fontSize: '1.125rem',
    fontWeight: '{typography.font.weight}',
  },
} satisfies KnobDesignTokens
